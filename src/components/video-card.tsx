
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Trash2, ListPlus, XCircle, Film } from 'lucide-react';
import type { VideoFile } from '@/lib/types';
import { formatDuration, cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { db } from '@/lib/db';
import { Progress } from './ui/progress';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { AddToPlaylistDialog } from './add-to-playlist-dialog';

interface VideoCardProps {
  video: VideoFile;
  onVideoDeleted: (videoId: string) => void;
  onVideoRemovedFromPlaylist?: (videoId: string) => void;
  context?: 'library' | 'playlist';
  playlistId?: string;
  layout?: 'grid' | 'list';
}

export function VideoCard({ 
  video, 
  onVideoDeleted,
  onVideoRemovedFromPlaylist,
  context = 'library',
  playlistId,
  layout = 'grid'
}: VideoCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    if (video.thumbnail) {
      url = URL.createObjectURL(video.thumbnail);
      setThumbnailUrl(url);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [video.thumbnail]);

  const handleDeleteConfirm = async () => {
    await db.deleteVideo(video.id);
    onVideoDeleted(video.id);
  };
  
  const handleRemoveFromPlaylist = () => {
    if(onVideoRemovedFromPlaylist) {
        onVideoRemovedFromPlaylist(video.id);
    }
  }

  const formattedDuration = useMemo(() => formatDuration(video.duration), [video.duration]);

  const playerUrl = context === 'playlist' && playlistId 
    ? `/player/${video.id}?playlist=${playlistId}`
    : `/player/${video.id}`;

  if (layout === 'list') {
    return (
      <>
        <div className="group">
          <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50">
            <CardContent className="p-0">
              <div className="flex items-center">
                <Link href={playerUrl} className="flex-shrink-0">
                  <div className="relative aspect-video w-48 bg-secondary">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={`Thumbnail for ${video.name}`}
                        fill
                        className="object-cover"
                        sizes="192px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md">
                        {formattedDuration}
                      </span>
                      {video.progress && video.progress > 0 && video.progress < 99 && (
                        <Progress value={video.progress} className="absolute bottom-0 h-0.5 rounded-none" />
                      )}
                  </div>
                </Link>
                <div className="p-4 flex-grow overflow-hidden">
                  <Link href={playerUrl}>
                    <h3 className="font-semibold leading-tight truncate text-foreground group-hover:text-primary">
                      {video.name}
                    </h3>
                  </Link>
                   <p className="text-sm text-muted-foreground mt-1 truncate">
                    Added on {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="px-4">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                      <DropdownMenuItem onClick={() => setIsAddToPlaylistOpen(true)}>
                        <ListPlus className="mr-2 h-4 w-4" />
                        <span>Add to Playlist</span>
                      </DropdownMenuItem>
                      {context === 'playlist' && onVideoRemovedFromPlaylist ? (
                        <DropdownMenuItem 
                          onClick={handleRemoveFromPlaylist}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          <span>Remove from Playlist</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => setIsDeleteDialogOpen(true)} 
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete from Library</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DeleteConfirmationDialog 
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
            itemName={video.name}
        />
        <AddToPlaylistDialog
          isOpen={isAddToPlaylistOpen}
          onOpenChange={setIsAddToPlaylistOpen}
          videoId={video.id}
        />
      </>
    );
  }

  return (
    <>
    <Link href={playerUrl} className="group block h-full">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 h-full flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="relative aspect-video">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={`Thumbnail for ${video.name}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
              {formattedDuration}
            </span>
             {video.progress && video.progress > 0 && video.progress < 99 && (
              <Progress value={video.progress} className="absolute bottom-0 h-1 rounded-none" />
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start flex-1">
              <h3 className="font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary">
                {video.name}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                   <DropdownMenuItem onClick={() => setIsAddToPlaylistOpen(true)}>
                    <ListPlus className="mr-2 h-4 w-4" />
                    <span>Add to Playlist</span>
                  </DropdownMenuItem>
                  {context === 'playlist' && onVideoRemovedFromPlaylist ? (
                    <DropdownMenuItem 
                      onClick={handleRemoveFromPlaylist}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      <span>Remove from Playlist</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)} 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete from Library</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Added on {new Date(video.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
    <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={video.name}
    />
    <AddToPlaylistDialog
      isOpen={isAddToPlaylistOpen}
      onOpenChange={setIsAddToPlaylistOpen}
      videoId={video.id}
    />
    </>
  );
}
