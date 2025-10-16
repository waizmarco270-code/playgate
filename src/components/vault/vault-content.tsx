
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
import { Lock, ShieldCheck, ShieldOff, CheckSquare, X, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { DeleteConfirmationDialog } from '../delete-confirmation-dialog';

export function VaultContent() {
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { lock } = useVault();

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);


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
            setVideos(prev => prev.filter(v => v.id !== updatedVideo.id));
             toast({
                title: "Moved to Library",
                description: "The video has been moved out of the vault.",
            });
        } else {
            setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
        }
    }
    
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

    const handleBulkRemoveFromVault = async () => {
        try {
            for(const videoId of Array.from(selectedVideoIds)) {
                await db.toggleVaultStatus(videoId, false);
            }
            setVideos(prev => prev.filter(v => !selectedVideoIds.has(v.id)));
             toast({
                title: `${selectedVideoIds.size} videos moved to library`,
            });
        } catch (e) {
            toast({ title: 'Error moving videos', variant: 'destructive' });
        } finally {
            toggleSelectionMode();
        }
    }


    return (
        <>
        <div className="flex flex-col h-full">
            <header className="relative flex items-center justify-between p-4 border-b overflow-hidden h-[73px]">
                 <AnimatePresence>
                    {!isSelectionMode && (
                         <motion.div
                            key="vault-header"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="absolute inset-0 p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="md:hidden" />
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <ShieldCheck className="text-primary" />
                                    Privacy Vault
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                 <Button variant="outline" onClick={toggleSelectionMode} disabled={videos.length === 0}>
                                    <CheckSquare className="mr-2 h-4 w-4" /> Select
                                </Button>
                                <Button variant="outline" onClick={lock}>
                                    <Lock className="mr-2 h-4 w-4" /> Lock Vault
                                </Button>
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
                                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                                    disabled={selectedVideoIds.size === 0}
                                >
                                    <ShieldOff className="mr-2 h-4 w-4" /> Remove from Vault
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
             <main className="flex-1 p-6 overflow-y-auto">
                {loading ? (
                <VideoGrid layout="grid">
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
                <VideoGrid layout="grid">
                    <VideoGrid.Content 
                        videos={videos} 
                        onVideoDeleted={onVideoDeleted}
                        onVideoUpdated={onVideoUpdated}
                        context="vault"
                        layout="grid"
                        isSelectionMode={isSelectionMode}
                        selectedVideoIds={selectedVideoIds}
                        onVideoSelect={handleVideoSelect}
                    />
                </VideoGrid>
                )}
            </main>
        </div>
         <DeleteConfirmationDialog 
            isOpen={isBulkDeleteDialogOpen}
            onOpenChange={setIsBulkDeleteDialogOpen}
            onConfirm={handleBulkRemoveFromVault}
            itemName={`${selectedVideoIds.size} videos`}
            itemType="videos"
            actionDescription="This will move the selected videos out of the vault and back into your main library. They will no longer be password-protected."
        />
        </>
    );

}

    