
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { VideoFile } from "@/lib/types";
import { formatDuration, cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";


const UpNextCard = ({ video, isCurrent, playlistId }: { video: VideoFile, isCurrent: boolean, playlistId?: string }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

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

    const href = playlistId ? `/player/${video.id}?playlist=${playlistId}` : `/player/${video.id}`;

    return (
        <Link href={href} className="block group">
            <div className={cn(
                "relative aspect-video rounded-lg overflow-hidden transition-all border-2",
                isCurrent ? "border-primary shadow-lg shadow-primary/40" : "border-transparent"
            )}>
                 {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt={`Thumbnail for ${video.name}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="200px"
                    />
                ) : (
                    <div className="w-full h-full bg-secondary"></div>
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
            <div className="mt-2">
                <h4 className="font-semibold text-sm truncate text-white">{video.name}</h4>
                <p className="text-xs text-muted-foreground">
                    {isCurrent ? <span className="text-primary font-medium">Now Playing</span> : formatDuration(video.duration)}
                </p>
            </div>
        </Link>
    )
}


export const UpNext = ({ videos, currentVideoId, title, playlistId }: { videos: VideoFile[], currentVideoId: string, title: string, playlistId?: string }) => {

    const currentVideoIndex = videos.findIndex(v => v.id === currentVideoId);

    return (
        <div className="w-full max-w-6xl p-4 md:p-6 bg-black/50">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <Carousel
                opts={{
                    align: "start",
                    dragFree: true,
                    skipSnaps: true,
                    startIndex: currentVideoIndex > 0 ? currentVideoIndex - 1 : 0
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {videos.map((video, index) => (
                    <CarouselItem key={video.id} className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 pl-4">
                       <UpNextCard video={video} isCurrent={video.id === currentVideoId} playlistId={playlistId} />
                    </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    )
}
