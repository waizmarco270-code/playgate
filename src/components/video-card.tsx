
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Trash2, ListPlus, XCircle, Film, CheckCircle2 } from 'lucide-react';
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
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (videoId: string) => void;
}

export function VideoCard({ 
  video, 
  onVideoDeleted,
  onVideoRemovedFromPlaylist,
  context = 'library',
  playlistId,
  layout = 'grid',
  isSelectionMode = false,
  isSelected = false,
  onSelect,
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

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSelectionMode && onSelect) {
      e.preventDefault();
      onSelect(video.id);
    }
  }

  const formattedDuration = useMemo(() => formatDuration(video.duration), [video.duration]);

  const playerUrl = context === 'playlist' && playlistId 
    ? `/player/${video.id}?playlist=${playlistId}`
    : `/player/${video.id}`;

  const Wrapper = isSelectionMode ? 'div' : Link;
  const wrapperProps = isSelectionMode ? {} : { href: playerUrl };


  if (layout === 'list') {
    return (
      <>
        <div className="group relative" onClick={handleCardClick}>
          <Card className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50",
            isSelectionMode && 'cursor-pointer',
            isSelected && 'border-primary shadow-lg shadow-primary/20'
          )}>
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="relative flex-shrink-0">
                  <Wrapper {...wrapperProps} className="flex-shrink-0">
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
                  </Wrapper>
                  {isSelectionMode && (
                     <div className="absolute top-2 left-2 z-10 p-1 rounded-full bg-background/70">
                        <CheckCircle2 className={cn("h-6 w-6 transition-colors", isSelected ? 'text-primary' : 'text-muted-foreground/50')} />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-grow overflow-hidden">
                  <Wrapper {...wrapperProps}>
                    <h3 className="font-semibold leading-tight truncate text-foreground group-hover:text-primary">
                      {video.name}
                    </h3>
                  </Wrapper>
                   <p className="text-sm text-muted-foreground mt-1 truncate">
                    Added on {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="px-4">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => { e.stopPropagation(); }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => { e.stopPropagation(); }}>
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
          videoIds={[video.id]}
        />
      </>
    );
  }

  return (
    <>
    <Wrapper {...wrapperProps} className="group block h-full">
      <div onClick={handleCardClick}>
        <Card className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 h-full flex flex-col",
            isSelectionMode && 'cursor-pointer',
            isSelected && 'border-primary shadow-lg shadow-primary/20 -translate-y-1 ring-2 ring-primary'
        )}>
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
              {isSelectionMode && (
                 <div className="absolute top-2 left-2 z-10 p-1 rounded-full bg-background/70">
                    <CheckCircle2 className={cn("h-6 w-6 transition-colors", isSelected ? 'text-primary' : 'text-muted-foreground/50')} />
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
                 {!isSelectionMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mr-2 -mt-1" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
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
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Added on {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Wrapper>
    <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={video.name}
    />
    <AddToPlaylistDialog
      isOpen={isAddToPlaylistOpen}
      onOpenChange={setIsAddToPlaylistOpen}
      videoIds={[video.id]}
    />
    </>
  );
}
