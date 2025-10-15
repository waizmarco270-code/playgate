
'use client';
import { useEffect, useState, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import type { Playlist, VideoFile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Film, ListVideo } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoGrid } from '@/components/video-grid';
import Link from 'next/link';
import Image from 'next/image';

export default function PlaylistDetailPage({ params }: { params: { id: string } }) {
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
    
    const onVideoDeleted = (deletedVideoId: string) => {
        // This is called when a video is deleted from the main library,
        // which might also be in this playlist.
        setVideos(prev => prev.filter(v => v.id !== deletedVideoId));
        // We don't need to call db.removeVideoFromPlaylist here because
        // db.deleteVideo already handles removing it from all playlists.
         toast({
          title: "Video Removed",
          description: "The video has been removed from this playlist.",
        });
    }

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <header className="p-4 border-b">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </header>
                <main className="flex-1 p-6">
                    <VideoGrid>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[125px] w-full rounded-xl" />
                                <div className="space-y-2">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-4 w-[150px]" />
                                </div>
                            </div>
                        ))}
                    </VideoGrid>
                </main>
            </div>
        );
    }
    
    if (!playlist) {
        return null; // Should be handled by notFound, but as a fallback.
    }


    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center gap-4 p-4 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.push('/playlists')}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{playlist.name}</h1>
                    <p className="text-muted-foreground">{playlist.description || 'No description'}</p>
                </div>
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
                    <VideoGrid>
                       <VideoGrid.Content videos={videos} onVideoDeleted={onVideoDeleted} />
                    </VideoGrid>
                )}
            </main>
        </div>
    );
}

