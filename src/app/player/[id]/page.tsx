'use client';

import { useEffect, useState, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import type { VideoFile } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function PlayerPage({ params }: { params: { id: string } }) {
  const [videoMetadata, setVideoMetadata] = useState<VideoFile | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const videoData = await db.getVideo(params.id);

        if (!videoData) {
          notFound();
          return;
        }
        
        setVideoMetadata(videoData.metadata);

        let file: File | null = null;
        if (videoData.handle) {
          // Verify permission first
          const options = { mode: 'read' };
          if (await videoData.handle.queryPermission(options) !== 'granted') {
            if (await videoData.handle.requestPermission(options) !== 'granted') {
              throw new Error('Permission denied to access the video file.');
            }
          }
          file = await videoData.handle.getFile();
        } else {
           // This is a fallback if the handle is not available.
           // It relies on re-fetching from a hidden input, which is not ideal.
           // The primary method should be via FileSystemFileHandle.
           // For this implementation, we cannot get the file without the handle.
           throw new Error("Could not load video file. File handle is missing. Please re-import the video.");
        }
        
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
        } else {
            throw new Error("Could not create video URL.");
        }

      } catch (err: any) {
        console.error('Failed to load video:', err);
        setError(err.message || 'An unexpected error occurred.');
        toast({
          title: 'Error loading video',
          description: err.message || 'Please try again or re-import the video.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadVideo();
    }

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [params.id, toast]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="w-24 h-10 mb-4" />
        <Skeleton className="w-full aspect-video mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
        <div className="p-6 max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Library
            </Button>
        </div>
    )
  }

  if (!videoMetadata) {
    return null; // notFound() would have been called
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="flex-1">
            <h1 className="text-xl font-bold truncate">{videoMetadata.name}</h1>
            <p className="text-sm text-muted-foreground">Added on {new Date(videoMetadata.createdAt).toLocaleDateString()}</p>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          )}
        </div>
      </main>
    </div>
  );
}
