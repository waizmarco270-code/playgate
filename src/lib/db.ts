'use client';
import { generateVideoThumbnail, getVideoDuration } from './utils';
import type { VideoFile, VideoFileHandle } from './types';

const DB_NAME = 'WaizPlayDB';
const DB_VERSION = 1;
const VIDEO_STORE = 'videos';
const FILE_HANDLE_STORE = 'fileHandles';

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

        const videoData: Omit<VideoFile, 'video'> = {
          id,
          name: file.name,
          thumbnail,
          duration,
          lastPlayed: 0,
          createdAt: new Date(),
          favorited: false,
        };
        
        const tx = db.transaction([VIDEO_STORE, FILE_HANDLE_STORE], 'readwrite');
        tx.objectStore(VIDEO_STORE).put(videoData);

        if (fileHandle) {
          const videoFileHandle: VideoFileHandle = {
            id,
            handle: fileHandle,
          };
          tx.objectStore(FILE_HANDLE_STORE).put(videoFileHandle);
        } else {
            // If there's no handle, we might need to store the file itself
            // For now, we assume we can get it again if needed, or that handles are preferred.
            // If offline access without handles is critical, we might store the file blob here.
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
      request.onsuccess = () => resolve(request.result as VideoFile[]);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getVideo(id: string): Promise<{ metadata: VideoFile, handle: FileSystemFileHandle | null } | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([VIDEO_STORE, FILE_HANDLE_STORE], 'readonly');
      const videoStore = tx.objectStore(VIDEO_STORE);
      const handleStore = tx.objectStore(FILE_HANDLE_STORE);

      let metadata: VideoFile;
      let handle: FileSystemFileHandle | null = null;
      let handleFound = false;

      const metadataRequest = videoStore.get(id);
      metadataRequest.onsuccess = () => {
        metadata = metadataRequest.result;
        if (!metadata) {
          resolve(null);
          return;
        }
        // If handle has been found or there was no handle to begin with, resolve.
        if (handleFound || !handleStore) {
            resolve({ metadata, handle });
        }
      };

      const handleRequest = handleStore.get(id);
      handleRequest.onsuccess = () => {
        handle = handleRequest.result?.handle ?? null;
        handleFound = true;
        if (metadata) {
            resolve({ metadata, handle });
        }
      };
      
      tx.oncomplete = () => {
        // This will be reached if one of the requests completes but the other doesn't find anything.
        if (metadata && !handleFound) {
          resolve({ metadata, handle: null });
        } else if (!metadata) {
          resolve(null);
        }
      }

      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteVideo(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([VIDEO_STORE, FILE_HANDLE_STORE], 'readwrite');
      tx.objectStore(VIDEO_STORE).delete(id);
      tx.objectStore(FILE_HANDLE_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearDB(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([VIDEO_STORE, FILE_HANDLE_STORE], 'readwrite');
      tx.objectStore(VIDEO_STORE).clear();
      tx.objectStore(FILE_HANDLE_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const db = new IndexedDBManager();