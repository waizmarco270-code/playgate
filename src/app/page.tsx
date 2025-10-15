
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { VideoGrid } from '@/components/video-grid';
import { db } from '@/lib/db';
import type { VideoFile } from '@/lib/types';
import { Film, Plus, Search, CheckSquare, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AddToPlaylistDialog } from '@/components/add-to-playlist-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

export default function HomePage() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);


  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const storedVideos = await db.getAllVideos();
      setVideos(storedVideos);
    } catch (error) {
      console.error('Failed to load videos:', error);
      toast({
        title: 'Error',
        description: 'Could not load videos from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    try {
      toast({
        title: 'Importing...',
        description: `Processing ${files.length} video(s). This may take a moment.`,
      });

      for (const file of Array.from(files)) {
        await db.addVideo(file, null);
      }

      toast({
        title: 'Success',
        description: `${files.length} video(s) imported successfully.`,
      });
      loadVideos();
    } catch (error) {
      console.error('Failed to import videos:', error);
      toast({
        title: 'Import Failed',
        description: 'Could not import videos. Please try again.',
        variant: 'destructive',
      });
    } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const onVideoDeleted = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    toast({
      title: "Video Deleted",
      description: "The video has been removed from your library.",
    });
  }
  
  const onVideoRenamed = (updatedVideo: VideoFile) => {
    setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedVideoIds(new Set());
  };

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoIds(prev => {
        const newSet = new Set(prev);
        if(newSet.has(videoId)) {
            newSet.delete(videoId);
        } else {
            newSet.add(videoId);
        }
        return newSet;
    });
  }
  
  const handlePlaylistDialogClose = (updated: boolean) => {
    setIsAddToPlaylistOpen(false);
    if(updated) {
        // Potentially refresh data or just exit selection mode
        toggleSelectionMode();
    }
  }


  const filteredVideos = videos.filter((video) =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const HeaderContent = () => {
    if(isSelectionMode) {
        return (
             <div className="flex items-center justify-between p-4 border-b bg-secondary w-full">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={toggleSelectionMode}>
                        <X />
                    </Button>
                    <h2 className="text-lg font-semibold">{selectedVideoIds.size} video(s) selected</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => setIsAddToPlaylistOpen(true)}
                        disabled={selectedVideoIds.size === 0}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add to Playlist
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b w-full">
            <h1 className="text-2xl font-bold self-start md:self-center">Video Library</h1>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search videos..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isMobile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={toggleSelectionMode}>
                          <CheckSquare className="mr-2 h-4 w-4" /> Select
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleImportClick}>
                           <Plus className="mr-2 h-4 w-4" /> Import Video
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button variant="outline" onClick={toggleSelectionMode}>
                        <CheckSquare className="mr-2 h-4 w-4" /> Select
                    </Button>
                    <Button onClick={handleImportClick}>
                        <Plus className="mr-2 h-4 w-4" /> Import Video
                    </Button>
                  </>
                )}
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="video/*,.mp4,.webm,.ogg,.mov,.avi,.mkv"
                    className="hidden"
                />
            </div>
        </div>
    )
  }

  return (
    <>
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between">
          <HeaderContent />
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <VideoGrid>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </VideoGrid>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="p-6 rounded-full bg-secondary mb-4">
              <Film className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Your Library is Empty</h2>
            <p className="mt-2 text-muted-foreground">Import your first video to get started.</p>
            <Button onClick={handleImportClick} className="mt-6">
              <Plus className="mr-2 h-4 w-4" /> Import Video
            </Button>
          </div>
        ) : filteredVideos.length === 0 && searchTerm ? (
           <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="p-6 rounded-full bg-secondary mb-4">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">No Results Found</h2>
            <p className="mt-2 text-muted-foreground text-center">No videos match your search term "{searchTerm}".</p>
          </div>
        ) : (
          <VideoGrid>
            <VideoGrid.Content 
                videos={filteredVideos} 
                onVideoDeleted={onVideoDeleted}
                onVideoRenamed={onVideoRenamed}
                context="library"
                isSelectionMode={isSelectionMode}
                selectedVideoIds={selectedVideoIds}
                onVideoSelect={handleVideoSelect}
            />
          </VideoGrid>
        )}
      </main>
    </div>
    {isSelectionMode && (
      <AddToPlaylistDialog
        isOpen={isAddToPlaylistOpen}
        onOpenChange={handlePlaylistDialogClose}
        videoIds={Array.from(selectedVideoIds)}
      />
    )}
    </>
  );
}
