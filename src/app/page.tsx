
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { VideoGrid } from '@/components/video-grid';
import { db } from '@/lib/db';
import type { VideoFile } from '@/lib/types';
import { Film, Plus, Search, CheckSquare, X, Trash2 } from 'lucide-react';
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

const Header = ({
    onImportClick,
    onSearchTermChange,
    searchTerm,
    videos,
    onVideosDeleted,
}: {
    onImportClick: () => void;
    onSearchTermChange: (term: string) => void;
    searchTerm: string;
    videos: VideoFile[];
    onVideosDeleted: () => void;
}) => {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
    const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const isMobile = useIsMobile();
    const { toast } = useToast();

    const toggleSelectionMode = () => {
        setIsSelectionMode(prev => !prev);
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

    const handleBulkDelete = async () => {
        try {
          for(const videoId of Array.from(selectedVideoIds)) {
            await db.deleteVideo(videoId);
          }
          toast({
            title: `${selectedVideoIds.size} videos deleted`,
          });
          onVideosDeleted();
        } catch(e) {
          toast({ title: 'Error deleting videos', variant: 'destructive' });
        } finally {
          toggleSelectionMode();
        }
      }

    // Un-select any videos that might have been deleted from the main list
    useEffect(() => {
        const videoIds = new Set(videos.map(v => v.id));
        setSelectedVideoIds(prev => {
            const newSet = new Set<string>();
            for(const id of Array.from(prev)) {
                if (videoIds.has(id)) {
                    newSet.add(id);
                }
            }
            return newSet;
        });
    }, [videos]);

    return (
        <>
        <header className="relative flex items-center justify-between p-4 border-b w-full overflow-hidden h-[73px]">
            <AnimatePresence>
                {!isSelectionMode && (
                    <motion.div
                        key="search-header"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="absolute inset-0 p-4 flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="h-10 w-10 md:hidden" />
                            <h1 className="text-2xl font-bold">Video Library</h1>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search videos..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => onSearchTermChange(e.target.value)}
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
                                        <DropdownMenuItem onSelect={onImportClick}>
                                            <Plus className="mr-2 h-4 w-4" /> Import Video
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={toggleSelectionMode}>
                                        <CheckSquare className="mr-2 h-4 w-4" /> Select
                                    </Button>
                                    <Button onClick={onImportClick}>
                                        <Plus className="mr-2 h-4 w-4" /> Import Video
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isSelectionMode && (
                    <motion.div
                        key="selection-header"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="absolute inset-0 p-4 flex items-center justify-between bg-secondary"
                    >
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={toggleSelectionMode}>
                                <X />
                            </Button>
                            <h2 className="text-lg font-semibold">{selectedVideoIds.size} video(s) selected</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="destructive"
                                onClick={() => setIsBulkDeleteDialogOpen(true)}
                                disabled={selectedVideoIds.size === 0}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                            <Button
                                onClick={() => setIsAddToPlaylistOpen(true)}
                                disabled={selectedVideoIds.size === 0}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add to Playlist
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
        <AddToPlaylistDialog
            isOpen={isAddToPlaylistOpen}
            onOpenChange={(isOpen) => {
                setIsAddToPlaylistOpen(isOpen);
                if (!isOpen) toggleSelectionMode();
            }}
            videoIds={Array.from(selectedVideoIds)}
        />
        <DeleteConfirmationDialog 
            isOpen={isBulkDeleteDialogOpen}
            onOpenChange={setIsBulkDeleteDialogOpen}
            onConfirm={handleBulkDelete}
            itemName={`${selectedVideoIds.size} videos`}
        />
        </>
    );
};


export default function HomePage() {
  const [allVideos, setAllVideos] = useState<VideoFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const loadVideos = useCallback(async () => {
    try {
      const storedVideos = await db.getAllVideos(false); // only get non-vaulted videos
      setAllVideos(storedVideos);
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
    setLoading(true);
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

    setLoading(true);
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
      loadVideos(); // Reload all videos
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
        setLoading(false);
    }
  };

  const onVideoDeletedOrUpdated = () => {
    loadVideos();
  };

  const filteredVideos = allVideos.filter((video) =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <div className="flex flex-col h-full">
      <Header 
        onImportClick={handleImportClick} 
        onSearchTermChange={setSearchTerm}
        searchTerm={searchTerm}
        videos={allVideos}
        onVideosDeleted={onVideoDeletedOrUpdated}
      />
       <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="video/*,.mp4,.webm,.ogg,.mov,.avi,.mkv"
          className="hidden"
      />
      
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
        ) : allVideos.length === 0 ? (
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
                    onVideoDeleted={onVideoDeletedOrUpdated}
                    onVideoUpdated={onVideoDeletedOrUpdated}
                    context="library"
                />
            </VideoGrid>
        )}
      </main>
    </div>
    </>
  );
}
