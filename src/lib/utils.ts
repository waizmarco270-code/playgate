
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function generateVideoThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    video.preload = 'metadata';

    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(1, video.duration / 2);
    });

    video.addEventListener('seeked', () => {
      if (!context) return reject('Canvas context not found');
      
      const aspectRatio = video.videoWidth / video.videoHeight;
      const maxWidth = 320;
      canvas.width = maxWidth;
      canvas.height = maxWidth / aspectRatio;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src);
        if (blob) {
          resolve(blob);
        } else {
          reject('Could not generate thumbnail blob');
        }
      }, 'image/jpeg', 0.8);
    });

    video.addEventListener('error', (e) => {
      URL.revokeObjectURL(video.src);
      reject(`Error loading video: ${(e.target as HTMLVideoElement).error?.message}`);
    });

    video.src = URL.createObjectURL(file);
  });
}

export function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
        }
        video.onerror = function() {
            reject("Error loading video file.");
        }
        video.src = window.URL.createObjectURL(file);
    });
}
