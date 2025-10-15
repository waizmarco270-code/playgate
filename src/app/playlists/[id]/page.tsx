
'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/db';
import type { Playlist, VideoFile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Film, GripVertical, Play } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Reorder } from 'framer-motion';
import { VideoCard } from '@/components/video-card';

export default function PlaylistDetailPage() {
    const params = useParams<{ id: string }>();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

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
            setVideos(videoDetails);
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

    const onVideoRenamed = (updatedVideo: VideoFile) => {
        setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
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
        setVideos(newOrder); // Optimistic UI update
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
            // Revert on error
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
        return null; // Should be handled by notFound, but as a fallback.
    }


    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between gap-4 p-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/playlists')}>
                        <ArrowLeft />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{playlist.name}</h1>
                        <p className="text-muted-foreground">{playlist.description || 'Drag and drop videos to reorder'}</p>
                    </div>
                </div>
                <Button onClick={handlePlayAll} disabled={videos.length === 0}>
                    <Play className="mr-2 h-4 w-4" />
                    Play All
                </Button>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                {videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="p-6 rounded-full bg-secondary mb-4">
                            <Film className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold">Playlist is Empty</h2>
                        <p className="mt-2 text-muted-foreground">Add some videos to this playlist from your library.</p>
                        <Link href="/">
                            <Button className="mt-6">Go to Library</Button>
                        </Link>
                    </div>
                ) : (
                    <Reorder.Group 
                        axis="y" 
                        values={videos} 
                        onReorder={handleReorder}
                        className="space-y-4 max-w-4xl mx-auto"
                    >
                       {videos.map(video => (
                           <Reorder.Item key={video.id} value={video} className="relative">
                               <VideoCard
                                    video={video}
                                    onVideoDeleted={onVideoDeletedFromLibrary} 
                                    onVideoRemovedFromPlaylist={handleRemoveVideoFromPlaylist}
                                    onVideoRenamed={onVideoRenamed}
                                    context="playlist"
                                    playlistId={playlist.id}
                                    layout="list"
                               />
                               <div className="absolute top-1/2 -translate-y-1/2 -left-8 text-muted-foreground cursor-grab active:cursor-grabbing">
                                 <GripVertical />
                               </div>
                           </Reorder.Item>
                       ))}
                    </Reorder.Group>
                )}
            </main>
        </div>
    );
}

    