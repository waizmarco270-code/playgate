
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MoreHorizontal, Trash2, Edit, ListVideo } from 'lucide-react';
import type { Playlist, VideoFile } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { db } from '@/lib/db';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { CreatePlaylistDialog } from './create-playlist-dialog';
import { useEffect } from 'react';

interface PlaylistCardProps {
  playlist: Playlist;
  onDeleted: (playlistId: string) => void;
  onUpdated: () => void;
}

export function PlaylistCard({ playlist, onDeleted, onUpdated }: PlaylistCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [firstVideo, setFirstVideo] = useState<VideoFile | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchFirstVideo = async () => {
      if (playlist.videoIds.length > 0) {
        const videos = await db.getVideosByIds([playlist.videoIds[0]]);
        if(videos.length > 0) {
            setFirstVideo(videos[0]);
        }
      } else {
        setFirstVideo(null);
      }
    };
    fetchFirstVideo();
  }, [playlist.videoIds]);

   useEffect(() => {
    let url: string | null = null;
    if (firstVideo?.thumbnail) {
      url = URL.createObjectURL(firstVideo.thumbnail);
      setThumbnailUrl(url);
    } else {
      setThumbnailUrl(null);
    }
    return () => {
        if(url) {
            URL.revokeObjectURL(url);
        }
    }
  }, [firstVideo]);


  const handleDeleteConfirm = async () => {
    await db.deletePlaylist(playlist.id);
    onDeleted(playlist.id);
  };
  
  const handlePlaylistUpdated = () => {
    onUpdated();
  }

  return (
    <>
      <div className="group relative">
        <Link href={`/playlists/${playlist.id}`}>
          <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 h-full flex flex-col">
            <div className="relative aspect-video bg-secondary">
               {thumbnailUrl ? (
                <Image
                    src={thumbnailUrl}
                    alt={`Thumbnail for ${playlist.name}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <ListVideo className="w-12 h-12 text-muted-foreground" />
                </div>
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                    {playlist.videoIds.length} video{playlist.videoIds.length !== 1 ? 's' : ''}
                </span>
            </div>
            <CardHeader className="flex-1">
              <CardTitle className="line-clamp-2 group-hover:text-primary">{playlist.name}</CardTitle>
              <CardDescription className="line-clamp-3">{playlist.description || 'No description'}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <div className="absolute top-2 right-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 opacity-80 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={playlist.name}
      />
      <CreatePlaylistDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onPlaylistCreated={handlePlaylistUpdated}
        playlistToEdit={playlist}
      />
    </>
  );
}
