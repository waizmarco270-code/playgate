
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import type { VideoFile } from '@/lib/types';
import { ArrowLeft, PictureInPicture, Gauge, FileVideo, CalendarDays, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration, formatBytes } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function PlayerPage({ params }: { params: { id: string } }) {
  const [videoMetadata, setVideoMetadata] = useState<VideoFile | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState('1');
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
          const options = { mode: 'read' as const };
          if (await videoData.handle.queryPermission(options) !== 'granted') {
            if (await videoData.handle.requestPermission(options) !== 'granted') {
              throw new Error('Permission denied to access the video file.');
            }
          }
          file = await videoData.handle.getFile();
        } else if (videoData.file) {
           file = videoData.file;
        } else {
           throw new Error("Could not load video file. File data is missing. Please re-import the video.");
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = Number(playbackRate);
    }
  }, [playbackRate]);

  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP Error:", err);
      toast({
        title: "Picture-in-Picture Failed",
        description: "Your browser may not support this feature.",
        variant: "destructive"
      })
    }
  }

  const formattedDuration = useMemo(() => videoMetadata ? formatDuration(videoMetadata.duration) : 'N/A', [videoMetadata]);
  const formattedSize = useMemo(() => videoMetadata ? formatBytes(videoMetadata.size) : 'N/A', [videoMetadata]);


  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="p-4 flex items-center gap-4 border-b">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Skeleton className="w-full max-w-5xl aspect-video" />
        </main>
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
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="p-4 flex items-center gap-4 border-b shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="flex-1 overflow-hidden">
            <h1 className="text-xl font-bold truncate" title={videoMetadata.name}>{videoMetadata.name}</h1>
            <p className="text-sm text-muted-foreground">Added on {new Date(videoMetadata.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Video Info</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <h3 className="font-medium leading-none">Video Details</h3>
                  <div className="flex items-center">
                    <FileVideo className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground flex-1">Type</span>
                    <span className="text-sm font-mono">{videoMetadata.type}</span>
                  </div>
                  <div className="flex items-center">
                    <Gauge className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground flex-1">Size</span>
                    <span className="text-sm font-mono">{formattedSize}</span>
                  </div>
                   <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground flex-1">Duration</span>
                    <span className="text-sm font-mono">{formattedDuration}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-24">
                  <Gauge className="mr-2 h-4 w-4" /> {playbackRate}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={playbackRate} onValueChange={setPlaybackRate}>
                  <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1">1x (Normal)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {document.pictureInPictureEnabled && (
                <Button variant="outline" size="icon" onClick={handleTogglePiP}>
                    <PictureInPicture className="h-4 w-4" />
                    <span className="sr-only">Toggle Picture-in-Picture</span>
                </Button>
            )}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 bg-black/90">
        <div className="w-full max-w-6xl aspect-video rounded-lg overflow-hidden shadow-2xl shadow-black/50">
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
