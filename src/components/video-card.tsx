'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import type { VideoFile } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { db } from '@/lib/db';

interface VideoCardProps {
  video: VideoFile;
  onVideoDeleted: (videoId: string) => void;
}

export function VideoCard({ video, onVideoDeleted }: VideoCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (video.thumbnail) {
      const url = URL.createObjectURL(video.thumbnail);
      setThumbnailUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [video.thumbnail]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`Are you sure you want to delete "${video.name}"?`)) {
      await db.deleteVideo(video.id);
      onVideoDeleted(video.id);
    }
  };

  const formattedDuration = useMemo(() => formatDuration(video.duration), [video.duration]);

  return (
    <Link href={`/player/${video.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
        <CardContent className="p-0">
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
                <p className="text-xs text-muted-foreground">No thumbnail</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
              {formattedDuration}
            </span>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
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
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
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
  );
}
