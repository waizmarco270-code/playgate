'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { VideoGrid } from '@/components/video-grid';
import { db } from '@/lib/db';
import type { VideoFile } from '@/lib/types';
import { Film, Plus, Search, Wind } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const storedVideos = await db.getAllVideos();
      setVideos(storedVideos);
    } catch (error) {
      console.error('Failed to load videos:', error);
      toast({
        title: 'Error',
        description: 'Could not load videos from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleImport = async () => {
    try {
      const handles = await window.showOpenFilePicker({
        multiple: true,
        types: [{ description: 'Video Files', accept: { 'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'] } }],
      });

      toast({
        title: 'Importing...',
        description: `Processing ${handles.length} video(s). This may take a moment.`,
      });

      for (const handle of handles) {
        const file = await handle.getFile();
        await db.addVideo(file, handle);
      }

      toast({
        title: 'Success',
        description: `${handles.length} video(s) imported successfully.`,
      });
      loadVideos();
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to import videos:', error);
        toast({
          title: 'Import Failed',
          description: 'Could not import videos. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };
  
  const onVideoDeleted = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    toast({
      title: "Video Deleted",
      description: "The video has been removed from your library.",
    });
  }

  const filteredVideos = videos.filter((video) =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Video Library</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleImport}>
            <Plus className="mr-2 h-4 w-4" /> Import Video
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <VideoGrid>
            {Array.from({ length: 8 }).map((_, i) => (
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
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-6 rounded-full bg-secondary mb-4">
              <Film className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Your Library is Empty</h2>
            <p className="mt-2 text-muted-foreground">Import your first video to get started.</p>
            <Button onClick={handleImport} className="mt-6">
              <Plus className="mr-2 h-4 w-4" /> Import Video
            </Button>
          </div>
        ) : (
          <VideoGrid>
            <VideoGrid.Content videos={filteredVideos} onVideoDeleted={onVideoDeleted} />
          </VideoGrid>
        )}
      </main>
    </div>
  );
}
