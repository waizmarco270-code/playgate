
'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { Playlist } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FolderKanban, Plus, Film } from "lucide-react";
import { PlaylistCard } from '@/components/playlist-card';
import { CreatePlaylistDialog } from '@/components/create-playlist-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { toast } = useToast();

    const loadPlaylists = async () => {
        setLoading(true);
        try {
            const storedPlaylists = await db.getAllPlaylists();
            setPlaylists(storedPlaylists);
        } catch (error) {
            console.error('Failed to load playlists:', error);
            toast({
                title: 'Error',
                description: 'Could not load playlists from the database.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlaylists();
    }, []);

    const handlePlaylistCreated = (newPlaylist: Playlist) => {
        setPlaylists(prev => [newPlaylist, ...prev]);
        loadPlaylists();
    };

    const handlePlaylistDeleted = (deletedPlaylistId: string) => {
        setPlaylists(prev => prev.filter(p => p.id !== deletedPlaylistId));
        toast({
            title: "Playlist Deleted",
            description: "The playlist has been successfully removed.",
        });
    }

    const handlePlaylistUpdated = () => {
        loadPlaylists();
    }

  return (
    <>
    <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b">
            <h1 className="text-2xl font-bold">Playlists</h1>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Playlist
            </Button>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
            {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[125px] w-full rounded-xl" />
                            <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                            </div>
                        </div>
                    ))}
                 </div>
            ) : playlists.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-6 rounded-full bg-secondary mb-4">
                        <Film className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold">No Playlists Yet</h2>
                    <p className="mt-2 text-muted-foreground">Create your first playlist to organize your videos.</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-6">
                        <Plus className="mr-2 h-4 w-4" /> Create Playlist
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {playlists.map(playlist => (
                        <PlaylistCard 
                            key={playlist.id} 
                            playlist={playlist}
                            onDeleted={handlePlaylistDeleted}
                            onUpdated={handlePlaylistUpdated}
                        />
                    ))}
                </div>
            )}
        </main>
    </div>
    <CreatePlaylistDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPlaylistCreated={handlePlaylistCreated}
    />
    </>
  );
}
