
'use client';
import { useState, useEffect, useCallback } from 'react';
import { VideoGrid } from '@/components/video-grid';
import { db } from '@/lib/db';
import type { VideoFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useVault } from '../providers/vault-provider';
import { Button } from '../ui/button';
import { Lock } from 'lucide-react';
import { ShieldCheck, ShieldOff } from 'lucide-react';

export function VaultContent() {
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { lock } = useVault();

    const loadVideos = useCallback(async () => {
        setLoading(true);
        try {
            const allVideos = await db.getAllVideos(true); // Get all videos
            setVideos(allVideos.filter(v => v.isVaulted));
        } catch (error) {
            console.error('Failed to load vaulted videos:', error);
            toast({
                title: 'Error',
                description: 'Could not load videos from the vault.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);


    const onVideoDeleted = (videoId: string) => {
        setVideos(prev => prev.filter(v => v.id !== videoId));
        toast({
        title: "Video Deleted",
        description: "The video has been removed from your library.",
        });
    }

    const onVideoUpdated = (updatedVideo: VideoFile) => {
        if (!updatedVideo.isVaulted) {
            // If removed from vault, remove from this view
            setVideos(prev => prev.filter(v => v.id !== updatedVideo.id));
        } else {
            // Otherwise, update it in the list (e.g. rename)
            setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
        }
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-primary" />
                        Privacy Vault
                    </h1>
                </div>
                 <Button variant="outline" onClick={lock}>
                    <Lock className="mr-2 h-4 w-4" /> Lock Vault
                </Button>
            </header>
             <main className="flex-1 p-6 overflow-y-auto">
                {loading ? (
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
                ) : videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="p-6 rounded-full bg-secondary mb-4">
                    <ShieldOff className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold">Your Vault is Empty</h2>
                    <p className="mt-2 text-muted-foreground">Move videos from your library to the vault to protect them.</p>
                </div>
                ) : (
                <VideoGrid>
                    <VideoGrid.Content 
                        videos={videos} 
                        onVideoDeleted={onVideoDeleted}
                        onVideoUpdated={onVideoUpdated}
                        context="vault"
                    />
                </VideoGrid>
                )}
            </main>
        </div>
    );

}
