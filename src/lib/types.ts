
export interface VideoFile {
  id: string;
  name: string;
  thumbnail: Blob;
  duration: number;
  lastPlayed: number;
  createdAt: Date;
  favorited: boolean;
  size: number;
  type: string;
  currentTime?: number;
  progress?: number; // 0-100
  isVaulted?: boolean;
  isCompleted?: boolean;
}

export interface StoredVideoFile extends VideoFile {
  video: File;
}

export interface VideoFileHandle {
  id: string;
  handle: FileSystemFileHandle;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  videoIds: string[];
  createdAt: Date;
}
