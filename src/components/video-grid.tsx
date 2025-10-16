
'use client';

import { VideoCard } from '@/components/video-card';
import type { VideoFile } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VideoGridProps {
  children: React.ReactNode;
  layout: 'grid' | 'list';
}

const VideoGridContent = ({ 
    videos, 
    onVideoDeleted,
    onVideoUpdated,
    onVideoRemovedFromPlaylist,
    context = 'library',
    playlistId,
    isSelectionMode,
    selectedVideoIds,
    onVideoSelect,
    layout = 'grid'
}: { 
    videos: VideoFile[], 
    onVideoDeleted: (videoId: string) => void,
    onVideoUpdated: (updatedVideo: VideoFile) => void,
    onVideoRemovedFromPlaylist?: (videoId: string) => void,
    context?: 'library' | 'playlist' | 'vault',
    playlistId?: string,
    isSelectionMode?: boolean,
    selectedVideoIds?: Set<string>,
    onVideoSelect?: (videoId: string) => void,
    layout?: 'grid' | 'list',
}) => {
  return (
    <AnimatePresence>
      {videos.map((video) => (
        <motion.div
          key={video.id}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <VideoCard 
            video={video} 
            onVideoDeleted={onVideoDeleted}
            onVideoUpdated={onVideoUpdated}
            onVideoRemovedFromPlaylist={onVideoRemovedFromPlaylist}
            context={context}
            playlistId={playlistId}
            layout={layout}
            isSelectionMode={isSelectionMode}
            isSelected={selectedVideoIds?.has(video.id)}
            onSelect={onVideoSelect}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export function VideoGrid({ children, layout }: VideoGridProps) {
  const containerClasses = cn({
    'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6': layout === 'grid',
    'flex flex-col gap-4 max-w-4xl mx-auto': layout === 'list'
  });

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

VideoGrid.Content = VideoGridContent;

    