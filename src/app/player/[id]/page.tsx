
'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { notFound, useRouter, useSearchParams, useParams } from 'next/navigation';
import { db } from '@/lib/db';
import type { Playlist, VideoFile } from '@/lib/types';
import { ArrowLeft, PictureInPicture, Gauge, FileVideo, CalendarDays, Info, SkipBack, SkipForward, Camera, AudioLines, Captions, MoreVertical, CheckCircle2 } from 'lucide-react';
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
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useInterval } from 'usehooks-ts';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';
import { UpNext } from '@/components/player/up-next';

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const [videoMetadata, setVideoMetadata] = useState<VideoFile | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState('1');
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistVideos, setPlaylistVideos] = useState<VideoFile[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);
  const [libraryVideos, setLibraryVideos] = useState<VideoFile[]>([]);

  // States for audio and subtitle tracks
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [textTracks, setTextTracks] = useState<TextTrack[]>([]);
  const [selectedAudioTrackId, setSelectedAudioTrackId] = useState<string>('');
  const [selectedTextTrackId, setSelectedTextTrackId] = useState<string>('off');


  const router = useRouter();
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlist');
  const isMobile = useIsMobile();

  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hasStartedFromSavedTime = useRef(false);

  const isPrevEnabled = playlist ? currentVideoIndex > 0 : false;
  const isNextEnabled = playlist ? currentVideoIndex < playlist.videoIds.length - 1 : false;

  const handleNext = useCallback(() => {
      if (playlist && isNextEnabled) {
          const nextVideoId = playlist.videoIds[currentVideoIndex + 1];
          router.push(`/player/${nextVideoId}?playlist=${playlistId}`);
      }
  }, [playlist, isNextEnabled, currentVideoIndex, router, playlistId]);
  
  const handlePrev = useCallback(() => {
      if (playlist && isPrevEnabled) {
          const prevVideoId = playlist.videoIds[currentVideoIndex - 1];
          router.push(`/player/${prevVideoId}?playlist=${playlistId}`);
      }
  }, [playlist, isPrevEnabled, currentVideoIndex, router, playlistId]);


  useEffect(() => {
    const loadVideo = async () => {
      if (!params?.id) return;
      setLoading(true);
      setError(null);
      hasStartedFromSavedTime.current = false;
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

        if (playlistId) {
            const playlistData = await db.getPlaylist(playlistId);
            if (playlistData) {
                setPlaylist(playlistData);
                const playlistVideoDetails = await db.getVideosByIds(playlistData.videoIds);
                setPlaylistVideos(playlistVideoDetails);
                const index = playlistData.videoIds.indexOf(params.id);
                setCurrentVideoIndex(index);
            }
        } else {
            // If not in a playlist, load library videos for "Up Next"
            const allLibraryVideos = await db.getAllVideos(videoData.metadata.isVaulted);
            setLibraryVideos(allLibraryVideos);
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

    // This cleanup function will run when the component unmounts or when params.id changes
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null); // Clear the URL state
      }
    };
  }, [params.id, playlistId, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      // Ignore shortcuts if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime += 5;
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime -= 5;
          break;
        case 'arrowup':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case 'm':
          video.muted = !video.muted;
          break;
        case 'f':
          e.preventDefault();
          if (!document.fullscreenElement) {
            playerContainerRef.current?.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
        case 'n': // next
            if (isNextEnabled) handleNext();
            break;
        case 'p': // previous
            if (isPrevEnabled) handlePrev();
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev, isNextEnabled, isPrevEnabled]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = Number(playbackRate);
    }
  }, [playbackRate]);

  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    // Seek to saved time
    if (videoMetadata?.currentTime && !hasStartedFromSavedTime.current) {
      if (videoMetadata.currentTime > 1 && videoMetadata.currentTime < videoMetadata.duration - 1) {
        video.currentTime = videoMetadata.currentTime;
      }
      hasStartedFromSavedTime.current = true;
    }
    
    // Setup audio and text tracks
    if (video.audioTracks && video.audioTracks.length > 1) {
      const audioTrackList = Array.from(video.audioTracks);
      setAudioTracks(audioTrackList);
      const enabledAudioTrack = audioTrackList.find(t => t.enabled);
      if(enabledAudioTrack) setSelectedAudioTrackId(enabledAudioTrack.id);
    }

    if (video.textTracks && video.textTracks.length > 0) {
      const textTrackList = Array.from(video.textTracks);
      setTextTracks(textTrackList);
      const visibleTextTrack = textTrackList.find(t => t.mode === 'showing');
      if (visibleTextTrack) {
          setSelectedTextTrackId(visibleTextTrack.id);
      } else {
          setSelectedTextTrackId('off');
      }
    }
  };
  
  // Handlers for changing tracks
  const handleAudioTrackChange = (trackId: string) => {
    if(!videoRef.current || !videoRef.current.audioTracks) return;
    for (let i = 0; i < videoRef.current.audioTracks.length; i++) {
        const track = videoRef.current.audioTracks[i];
        track.enabled = track.id === trackId;
    }
    setSelectedAudioTrackId(trackId);
  }

  const handleTextTrackChange = (trackId: string) => {
    if(!videoRef.current || !videoRef.current.textTracks) return;
     for (let i = 0; i < videoRef.current.textTracks.length; i++) {
        const track = videoRef.current.textTracks[i];
        if (trackId === 'off') {
             track.mode = 'disabled';
        } else {
            track.mode = track.id === trackId ? 'showing' : 'hidden';
        }
    }
    setSelectedTextTrackId(trackId);
  }

  useInterval(
    async () => {
      if (videoRef.current && !videoRef.current.paused && videoMetadata) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
        await db.updateVideoProgress(videoMetadata.id, currentTime, progress);
        if (progress > 98 && !videoMetadata.isCompleted) {
          const updatedVideo = await db.toggleVideoCompletedStatus(videoMetadata.id, true);
          setVideoMetadata(updatedVideo);
        }
      }
    },
    5000 // Save progress every 5 seconds
  );

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

  const handleSetThumbnail = useCallback(() => {
    if (!videoRef.current || !videoMetadata) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      toast({ title: "Error", description: "Could not capture thumbnail.", variant: "destructive" });
      return;
    }

    const aspectRatio = video.videoWidth / video.videoHeight;
    const maxWidth = 320;
    canvas.width = maxWidth;
    canvas.height = maxWidth / aspectRatio;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (blob && videoMetadata) {
        try {
          await db.updateVideoThumbnail(videoMetadata.id, blob);
          toast({
            title: "Thumbnail Updated",
            description: "The new thumbnail has been saved.",
          });
        } catch (error) {
          console.error("Failed to save thumbnail:", error);
          toast({ title: "Error", description: "Failed to save thumbnail.", variant: "destructive" });
        }
      }
    }, 'image/jpeg', 0.8);
  }, [videoMetadata, toast]);

  const handleVideoEnded = async () => {
    if (videoMetadata && !videoMetadata.isCompleted) {
        const updatedVideo = await db.toggleVideoCompletedStatus(videoMetadata.id, true);
        setVideoMetadata(updatedVideo);
    }
    if (isNextEnabled) {
      handleNext();
    }
  }

  const formattedDuration = useMemo(() => videoMetadata ? formatDuration(videoMetadata.duration) : 'N/A', [videoMetadata]);
  const formattedSize = useMemo(() => videoMetadata ? formatBytes(videoMetadata.size) : 'N/A', [videoMetadata]);


  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
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
        <div className="p-6 max-w-4xl mx-auto text-center h-full flex flex-col justify-center items-center">
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
  
  const DesktopControls = () => (
     <div className="hidden md:flex items-center gap-1.5">
        <Button variant="outline" size="icon" onClick={handleSetThumbnail} title="Set current frame as thumbnail">
          <Camera className="h-4 w-4" />
          <span className="sr-only">Set as Thumbnail</span>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" title="Video Info">
              <Info className="h-4 w-4" />
              <span className="sr-only">Video Info</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium leading-none">Video Details</h3>
                {videoMetadata.isCompleted && <div className="flex items-center gap-1.5 text-xs text-green-500"><CheckCircle2 className="h-3.5 w-3.5" />Completed</div>}
              </div>
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
        
        {audioTracks.length > 0 && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" title="Audio Tracks">
                        <AudioLines className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={selectedAudioTrackId} onValueChange={handleAudioTrackChange}>
                      {audioTracks.map(track => (
                          <DropdownMenuRadioItem key={track.id} value={track.id}>{track.label || `Track ${track.id}`}</DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        )}

        {textTracks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" title="Subtitles">
                        <Captions className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={selectedTextTrackId} onValueChange={handleTextTrackChange}>
                        <DropdownMenuRadioItem value="off">Off</DropdownMenuRadioItem>
                        {textTracks.map(track => (
                          <DropdownMenuRadioItem key={track.id} value={track.id}>{track.label || `Track ${track.id}`}</DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        )}


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-24" title="Playback speed">
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
            <Button variant="outline" size="icon" onClick={handleTogglePiP} title="Picture-in-Picture">
                <PictureInPicture className="h-4 w-4" />
                <span className="sr-only">Toggle Picture-in-Picture</span>
            </Button>
        )}
    </div>
  );

  const MobileControls = () => (
    <div className="flex md:hidden">
       <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuItem onSelect={handleSetThumbnail}>
                <Camera className="mr-2 h-4 w-4" />
                <span>Set Thumbnail</span>
              </DropdownMenuItem>
             <DropdownMenuItem onSelect={handleTogglePiP} disabled={!document.pictureInPictureEnabled}>
                <PictureInPicture className="mr-2 h-4 w-4" />
                <span>PiP</span>
             </DropdownMenuItem>
             {audioTracks.length > 0 && <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                 <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                       <AudioLines className="mr-2 h-4 w-4" />
                        <span>Audio</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={selectedAudioTrackId} onValueChange={handleAudioTrackChange}>
                            {audioTracks.map(track => (
                                <DropdownMenuRadioItem key={track.id} value={track.id}>{track.label || `Track ${track.id}`}</DropdownMenuRadioItem>
                            ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
             </DropdownMenuItem>}
             {textTracks.length > 0 && <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                 <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                       <Captions className="mr-2 h-4 w-4" />
                       <span>Subtitles</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={selectedTextTrackId} onchange={handleTextTrackChange}>
                                <DropdownMenuRadioItem value="off">Off</DropdownMenuRadioItem>
                                {textTracks.map(track => (
                                    <DropdownMenuRadioItem key={track.id} value={track.id}>{track.label || `Track ${track.id}`}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
             </DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-2 md:p-4 flex items-center gap-2 border-b shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold truncate" title={videoMetadata.name}>{videoMetadata.name}</h1>
              {videoMetadata.isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">{playlist ? `${playlist.name} (${currentVideoIndex + 1} / ${playlist.videoIds.length})` : `Added on ${new Date(videoMetadata.createdAt).toLocaleDateString()}`}</p>
        </div>
        <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={handlePrev} disabled={!isPrevEnabled} title="Previous (p)">
                <SkipBack className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} disabled={!isNextEnabled} title="Next (n)">
                <SkipForward className="h-5 w-5" />
            </Button>
            {isMobile ? <MobileControls /> : <DesktopControls />}
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-0 md:p-4 bg-black/90" ref={playerContainerRef}>
        <div className="w-full h-full max-w-6xl md:aspect-video md:rounded-lg overflow-hidden shadow-2xl shadow-black/50">
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              onCanPlay={handleCanPlay}
              onEnded={handleVideoEnded}
              crossOrigin="anonymous" 
            />
          )}
        </div>
        {playlistId && playlistVideos.length > 0 ? (
            <UpNext title="My Playlist" videos={playlistVideos} currentVideoId={videoMetadata.id} playlistId={playlistId} />
        ) : !playlistId && libraryVideos.length > 1 ? (
            <UpNext title="My Library" videos={libraryVideos} currentVideoId={videoMetadata.id} />
        ) : null}
      </main>
    </div>
  );
}
