export interface VideoFile {
  id: string;
  name: string;
  thumbnail: Blob;
  duration: number;
  lastPlayed: number;
  createdAt: Date;
  favorited: boolean;
}

export interface StoredVideoFile extends VideoFile {
  video: File;
}

export interface VideoFileHandle {
  id: string;
  handle: FileSystemFileHandle;
}
