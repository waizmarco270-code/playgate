
'use client';

import { VideoCard } from '@/components/video-card';
import type { VideoFile } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

interface VideoGridProps {
  children: React.ReactNode;
}

const VideoGridContent = ({ 
    videos, 
    onVideoDeleted,
    onVideoRenamed,
    onVideoRemovedFromPlaylist,
    context = 'library',
    playlistId,
    isSelectionMode,
    selectedVideoIds,
    onVideoSelect,
}: { 
    videos: VideoFile[], 
    onVideoDeleted: (videoId: string) => void,
    onVideoRenamed: (updatedVideo: VideoFile) => void,
    onVideoRemovedFromPlaylist?: (videoId: string) => void,
    context?: 'library' | 'playlist',
    playlistId?: string,
    isSelectionMode?: boolean,
    selectedVideoIds?: Set<string>,
    onVideoSelect?: (videoId: string) => void,
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
            onVideoRenamed={onVideoRenamed}
            onVideoRemovedFromPlaylist={onVideoRemovedFromPlaylist}
            context={context}
            playlistId={playlistId}
            isSelectionMode={isSelectionMode}
            isSelected={selectedVideoIds?.has(video.id)}
            onSelect={onVideoSelect}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export function VideoGrid({ children }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {children}
    </div>
  );
}

VideoGrid.Content = VideoGridContent;

    