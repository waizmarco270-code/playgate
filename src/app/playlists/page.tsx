
'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { Playlist } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FolderKanban, Plus, Film, FolderDown, MoreVertical } from "lucide-react";
import { PlaylistCard } from '@/components/playlist-card';
import { CreatePlaylistDialog } from '@/components/create-playlist-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { FileSystemFileHandle } from 'wicg-file-system-access';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';


const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'];

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();


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
    
    const handleImportFolder = async () => {
        if (typeof window.showDirectoryPicker !== 'function') {
            toast({
                title: "Browser Not Supported",
                description: "Your browser does not support folder imports. Please try a different browser like Chrome or Edge.",
                variant: "destructive",
            });
            return;
        }

        try {
            const directoryHandle = await window.showDirectoryPicker();
            
            toast({
                title: `Importing "${directoryHandle.name}"`,
                description: "Scanning folder for videos...",
            });

            const videoFiles: { file: File, handle: FileSystemFileHandle }[] = [];
            for await (const entry of directoryHandle.values()) {
                if (entry.kind === 'file' && entry.name.match(/\.(mp4|webm|ogg|mov|mkv)$/i)) {
                    const file = await entry.getFile();
                     if (ACCEPTED_VIDEO_TYPES.some(type => file.type.startsWith(type))) {
                        videoFiles.push({ file, handle: entry });
                    }
                }
            }

            if (videoFiles.length === 0) {
                toast({
                    title: "No Videos Found",
                    description: `The folder "${directoryHandle.name}" does not contain any supported video files.`,
                    variant: "destructive",
                });
                return;
            }

            const newPlaylist = await db.createPlaylist(directoryHandle.name, `Imported from folder`);

            for (const { file, handle } of videoFiles) {
                await db.addVideo(file, handle);
                await db.addVideoToPlaylist(newPlaylist.id, `${file.name}-${file.lastModified}`);
            }

            toast({
                title: "Import Complete",
                description: `Created playlist "${newPlaylist.name}" with ${videoFiles.length} videos.`,
            });
            
            loadPlaylists();

        } catch (error: any) {
            if (error.name === 'AbortError') {
                // User cancelled the picker
                return;
            }
            console.error("Failed to import folder:", error);
            toast({
                title: "Import Failed",
                description: "Could not import the selected folder.",
                variant: "destructive",
            });
        }
    }


  return (
    <>
    <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-2xl font-bold">Playlists</h1>
            </div>
            <div className="flex items-center gap-2">
                 {isMobile ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={handleImportFolder}>
                                <FolderDown className="mr-2 h-4 w-4" /> Import Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setIsCreateDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Create Playlist
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                        <Button variant="outline" onClick={handleImportFolder}>
                            <FolderDown className="mr-2 h-4 w-4" /> Import Folder
                        </Button>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Playlist
                        </Button>
                    </>
                 )}
            </div>
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
