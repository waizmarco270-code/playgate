
'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/db';
import type { Playlist, VideoFile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Film, GripVertical, Play, Plus, CheckSquare, X, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { VideoCard } from '@/components/video-card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

export default function PlaylistDetailPage() {
    const params = useParams<{ id: string }>();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);


    const loadPlaylistDetails = useCallback(async () => {
        setLoading(true);
        try {
            const playlistData = await db.getPlaylist(params.id);
            if (!playlistData) {
                notFound();
                return;
            }
            setPlaylist(playlistData);
            const videoDetails = await db.getVideosByIds(playlistData.videoIds);
            
            const visibleVideos = videoDetails.filter(v => !v.isVaulted);
            setVideos(visibleVideos);

        } catch (error) {
            console.error('Failed to load playlist:', error);
            toast({
                title: 'Error',
                description: 'Could not load the playlist.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [params.id, toast]);

    useEffect(() => {
        loadPlaylistDetails();
    }, [loadPlaylistDetails]);
    
    const onVideoDeletedFromLibrary = (deletedVideoId: string) => {
        setVideos(prev => prev.filter(v => v.id !== deletedVideoId));
        toast({
          title: "Video Removed",
          description: "The video has been removed from this playlist because it was deleted from the library.",
        });
    }

    const onVideoUpdated = (updatedVideo: VideoFile) => {
         if (updatedVideo.isVaulted) {
            setVideos(prev => prev.filter(v => v.id !== updatedVideo.id));
        } else {
            setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
        }
    }


    const handleRemoveVideoFromPlaylist = async (videoId: string) => {
        if (!playlist) return;
        try {
            await db.removeVideoFromPlaylist(playlist.id, videoId);
            setVideos(prev => prev.filter(v => v.id !== videoId));
            setPlaylist(prev => prev ? {...prev, videoIds: prev.videoIds.filter(id => id !== videoId)} : null);
            toast({
                title: "Video Removed",
                description: "The video has been removed from this playlist.",
            });
        } catch (error) {
             console.error('Failed to remove video from playlist:', error);
            toast({
                title: 'Error',
                description: 'Could not remove the video from the playlist.',
                variant: 'destructive',
            });
        }
    }

    const handleReorder = async (newOrder: VideoFile[]) => {
        if (!playlist) return;
        setVideos(newOrder); 
        const newVideoIds = newOrder.map(v => v.id);
        try {
            await db.updatePlaylistVideoOrder(playlist.id, newVideoIds);
            toast({
                title: "Playlist Updated",
                description: "The video order has been saved."
            });
        } catch (error) {
            console.error('Failed to reorder playlist:', error);
            toast({
                title: 'Error',
                description: 'Could not save the new video order.',
                variant: 'destructive',
            });
            loadPlaylistDetails();
        }
    }

    const handlePlayAll = () => {
        if (playlist && videos.length > 0) {
            router.push(`/player/${videos[0].id}?playlist=${playlist.id}`);
        } else {
            toast({
                title: "Playlist is empty",
                description: "Add videos to this playlist to play them.",
                variant: "destructive"
            });
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !playlist) {
            return;
        }

        try {
            toast({
                title: 'Importing...',
                description: `Adding ${files.length} video(s) to "${playlist.name}".`,
            });

            for (const file of Array.from(files)) {
                const videoId = `${file.name}-${file.lastModified}`;
                const existing = await db.getVideo(videoId);
                if(!existing) {
                    await db.addVideo(file, null);
                }
                await db.addVideoToPlaylist(playlist.id, videoId);
            }

            toast({
                title: 'Success',
                description: `${files.length} video(s) imported and added to the playlist.`,
            });
            loadPlaylistDetails(); // Reload to show new videos
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
    };

    const handleBulkRemoveFromPlaylist = async () => {
        if (!playlist) return;
        try {
            for (const videoId of Array.from(selectedVideoIds)) {
                await db.removeVideoFromPlaylist(playlist.id, videoId);
            }
            setVideos(prev => prev.filter(v => !selectedVideoIds.has(v.id)));
            setPlaylist(prev => prev ? {...prev, videoIds: prev.videoIds.filter(id => !selectedVideoIds.has(id))} : null);
            toast({
                title: `${selectedVideoIds.size} videos removed`,
                description: "The videos have been removed from this playlist.",
            });
        } catch(e) {
             toast({ title: 'Error removing videos', variant: 'destructive' });
        } finally {
            toggleSelectionMode();
        }
    }


    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-4">
                         <Skeleton className="h-10 w-10" />
                        <div>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64 mt-2" />
                        </div>
                    </div>
                     <Skeleton className="h-10 w-28" />
                </header>
                <main className="flex-1 p-6">
                   <div className="space-y-4 max-w-4xl mx-auto">
                        {Array.from({ length: 3 }).map((_, i) => (
                           <Skeleton key={i} className="h-24 w-full rounded-lg" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }
    
    if (!playlist) {
        return null;
    }


    return (
        <>
        <div className="flex flex-col h-full">
            <header className="relative flex items-center justify-between gap-4 p-4 border-b overflow-hidden h-[89px]">
                <AnimatePresence>
                    {!isSelectionMode && (
                        <motion.div
                            key="playlist-header"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="absolute inset-0 p-4 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="md:hidden" />
                                <Button variant="ghost" size="icon" onClick={() => router.push('/playlists')} className="hidden md:inline-flex">
                                    <ArrowLeft />
                                </Button>
                                <div className="max-w-md">
                                    <h1 className="text-2xl font-bold truncate">{playlist.name}</h1>
                                    <p className="text-muted-foreground truncate">{playlist.description || 'Drag and drop videos to reorder'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={handleImportClick}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Import
                                </Button>
                                 <Button variant="outline" onClick={toggleSelectionMode}>
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    Select
                                </Button>
                                <Button onClick={handlePlayAll} disabled={videos.length === 0}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Play All
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    multiple
                                    accept="video/*,.mp4,.webm,.ogg,.mov,.avi,.mkv"
                                    className="hidden"
                                />
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
                                <Trash2 className="mr-2 h-4 w-4" /> Remove from Playlist
                            </Button>
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                {videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="p-6 rounded-full bg-secondary mb-4">
                            <Film className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold">Playlist is Empty</h2>
                        <p className="mt-2 text-muted-foreground">Import your first video to this playlist.</p>
                        <Button onClick={handleImportClick} className="mt-6">
                            <Plus className="mr-2 h-4 w-4" /> Import Video
                        </Button>
                    </div>
                ) : (
                    <Reorder.Group 
                        axis="y" 
                        values={videos} 
                        onReorder={handleReorder}
                        className="space-y-4 max-w-4xl mx-auto"
                    >
                       {videos.map(video => (
                           <Reorder.Item 
                                key={video.id} 
                                value={video} 
                                className="relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                           >
                               <VideoCard
                                    video={video}
                                    onVideoDeleted={onVideoDeletedFromLibrary} 
                                    onVideoRemovedFromPlaylist={handleRemoveVideoFromPlaylist}
                                    onVideoUpdated={onVideoUpdated}
                                    context="playlist"
                                    playlistId={playlist.id}
                                    layout="list"
                                    isSelectionMode={isSelectionMode}
                                    isSelected={selectedVideoIds.has(video.id)}
                                    onSelect={handleVideoSelect}
                               />
                               {!isSelectionMode && (
                                <div className="absolute top-1/2 -translate-y-1/2 -left-8 text-muted-foreground cursor-grab active:cursor-grabbing">
                                    <GripVertical />
                                </div>
                               )}
                           </Reorder.Item>
                       ))}
                    </Reorder.Group>
                )}
            </main>
        </div>
         <DeleteConfirmationDialog 
            isOpen={isBulkDeleteDialogOpen}
            onOpenChange={setIsBulkDeleteDialogOpen}
            onConfirm={handleBulkRemoveFromPlaylist}
            itemName={`${selectedVideoIds.size} videos from this playlist`}
        />
        </>
    );
}
