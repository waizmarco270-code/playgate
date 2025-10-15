
'use client';
import { generateVideoThumbnail, getVideoDuration } from './utils';
import type { VideoFile, VideoFileHandle, StoredVideoFile, Playlist } from './types';

const DB_NAME = 'WaizPlayDB';
const DB_VERSION = 3; // Incremented version due to schema change for playlists
const VIDEO_STORE = 'videos';
const FILE_HANDLE_STORE = 'fileHandles';
const PLAYLIST_STORE = 'playlists';

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB is not supported.');
        return reject('IndexedDB not supported');
      }
      if (this.db) {
        return resolve();
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject('IndexedDB error');
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(VIDEO_STORE)) {
          db.createObjectStore(VIDEO_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(FILE_HANDLE_STORE)) {
          db.createObjectStore(FILE_HANDLE_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(PLAYLIST_STORE)) {
          db.createObjectStore(PLAYLIST_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  async addVideo(file: File, fileHandle: FileSystemFileHandle | null): Promise<void> {
    const db = await this.getDB();
    const id = `${file.name}-${file.lastModified}`;

    return new Promise(async (resolve, reject) => {
      try {
        const [thumbnail, duration] = await Promise.all([
            generateVideoThumbnail(file),
            getVideoDuration(file),
        ]);

        const videoData: StoredVideoFile = {
          id,
          name: file.name,
          thumbnail,
          duration,
          lastPlayed: 0,
          createdAt: new Date(),
          favorited: false,
          size: file.size,
          type: file.type,
          video: file, // Store the file blob itself
          currentTime: 0,
          progress: 0,
        };
        
        const tx = db.transaction([VIDEO_STORE, FILE_HANDLE_STORE], 'readwrite');
        tx.objectStore(VIDEO_STORE).put(videoData);

        if (fileHandle) {
          const videoFileHandle: VideoFileHandle = {
            id,
            handle: fileHandle,
          };
          tx.objectStore(FILE_HANDLE_STORE).put(videoFileHandle);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAllVideos(): Promise<VideoFile[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE, 'readonly');
      const store = tx.objectStore(VIDEO_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        // We don't need the `video` blob for the grid view, so we can remove it to save memory
        const videos = (request.result as StoredVideoFile[]).map(({ video, ...rest }) => rest).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
        resolve(videos);
      }
      request.onerror = () => reject(request.error);
    });
  }
  
  async getVideosByIds(ids: string[]): Promise<VideoFile[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE, 'readonly');
      const store = tx.objectStore(VIDEO_STORE);
      const videos: VideoFile[] = [];
      if (ids.length === 0) {
        resolve([]);
        return;
      }
      
      const idSet = new Set(ids);
      let count = 0;

      store.openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (idSet.has(cursor.key as string)) {
            const { video, ...rest } = cursor.value;
            videos.push(rest);
            count++;
          }
          if (count < idSet.size) {
            cursor.continue();
          } else {
             // Re-order based on original IDs array
            const orderedVideos = ids.map(id => videos.find(v => v.id === id)).filter(Boolean) as VideoFile[];
            resolve(orderedVideos);
          }
        } else {
          const orderedVideos = ids.map(id => videos.find(v => v.id === id)).filter(Boolean) as VideoFile[];
          resolve(orderedVideos);
        }
      };

      tx.onerror = () => reject(tx.error);
    });
}


  async getVideo(id: string): Promise<{ metadata: VideoFile, handle: FileSystemFileHandle | null, file: File | null } | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([VIDEO_STORE, FILE_HANDLE_STORE], 'readonly');
      const videoStore = tx.objectStore(VIDEO_STORE);
      const handleStore = tx.objectStore(FILE_HANDLE_STORE);

      let videoData: StoredVideoFile;
      let handle: FileSystemFileHandle | null = null;
      let requestsCompleted = 0;
      const totalRequests = 2;

      const onComplete = () => {
        if (++requestsCompleted < totalRequests) return;
        
        if (!videoData) {
            resolve(null);
            return;
        }

        const { video: videoFile, ...metadata } = videoData;
        resolve({ metadata, handle, file: videoFile || null });
      }

      const metadataRequest = videoStore.get(id);
      metadataRequest.onsuccess = () => {
        videoData = metadataRequest.result;
        onComplete();
      };
      metadataRequest.onerror = () => reject(metadataRequest.error);

      const handleRequest = handleStore.get(id);
      handleRequest.onsuccess = () => {
        handle = handleRequest.result?.handle ?? null;
        onComplete();
      };
      handleRequest.onerror = () => reject(handleRequest.error);
    });
  }

  async updateVideoProgress(id: string, currentTime: number, progress: number): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(VIDEO_STORE, 'readwrite');
        const store = tx.objectStore(VIDEO_STORE);
        const request = store.get(id);

        request.onsuccess = () => {
            const videoData = request.result;
            if (videoData) {
                videoData.currentTime = currentTime;
                videoData.progress = progress;
                videoData.lastPlayed = Date.now();
                store.put(videoData);
            }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
  }

  async updateVideoThumbnail(id: string, thumbnail: Blob): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(VIDEO_STORE, 'readwrite');
        const store = tx.objectStore(VIDEO_STORE);
        const request = store.get(id);

        request.onsuccess = () => {
            const videoData = request.result;
            if (videoData) {
                videoData.thumbnail = thumbnail;
                store.put(videoData);
            } else {
                reject("Video not found");
            }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
  }

  async deleteVideo(id: string): Promise<void> {
    const db = await this.getDB();
    // Also remove this video from any playlists
    const playlists = await this.getAllPlaylists();
    for (const playlist of playlists) {
        if (playlist.videoIds.includes(id)) {
            await this.removeVideoFromPlaylist(playlist.id, id);
        }
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction([VIDEO_STORE, FILE_HANDLE_STORE], 'readwrite');
      tx.objectStore(VIDEO_STORE).delete(id);
      tx.objectStore(FILE_HANDLE_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // PLAYLIST METHODS
  async createPlaylist(name: string, description: string): Promise<Playlist> {
    const db = await this.getDB();
    const id = `playlist-${Date.now()}`;
    const newPlaylist: Playlist = {
      id,
      name,
      description,
      videoIds: [],
      createdAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(PLAYLIST_STORE, 'readwrite');
      const store = tx.objectStore(PLAYLIST_STORE);
      store.add(newPlaylist);
      tx.oncomplete = () => resolve(newPlaylist);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PLAYLIST_STORE, 'readonly');
      const store = tx.objectStore(PLAYLIST_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        resolve((request.result as Playlist[]).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PLAYLIST_STORE, 'readonly');
      const store = tx.objectStore(PLAYLIST_STORE);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updatePlaylist(playlist: Playlist): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PLAYLIST_STORE, 'readwrite');
      tx.objectStore(PLAYLIST_STORE).put(playlist);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async updatePlaylistVideoOrder(playlistId: string, videoIds: string[]): Promise<void> {
    const playlist = await this.getPlaylist(playlistId);
    if (playlist) {
      playlist.videoIds = videoIds;
      await this.updatePlaylist(playlist);
    }
  }

  async deletePlaylist(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PLAYLIST_STORE, 'readwrite');
      tx.objectStore(PLAYLIST_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async addVideoToPlaylist(playlistId: string, videoId: string): Promise<void> {
    const playlist = await this.getPlaylist(playlistId);
    if (playlist && !playlist.videoIds.includes(videoId)) {
      playlist.videoIds.push(videoId);
      await this.updatePlaylist(playlist);
    }
  }

  async removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
    const playlist = await this.getPlaylist(playlistId);
    if (playlist) {
      playlist.videoIds = playlist.videoIds.filter(id => id !== videoId);
      await this.updatePlaylist(playlist);
    }
  }

  async clearDB(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([VIDEO_STORE, FILE_HANDLE_STORE, PLAYLIST_STORE], 'readwrite');
      tx.objectStore(VIDEO_STORE).clear();
      tx.objectStore(FILE_HANDLE_STORE).clear();
      tx.objectStore(PLAYLIST_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const db = new IndexedDBManager();
