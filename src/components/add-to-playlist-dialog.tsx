
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { db } from '@/lib/db';
import type { Playlist } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface AddToPlaylistDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean, updated?: boolean) => void;
  videoIds: string[];
}

export function AddToPlaylistDialog({
  isOpen,
  onOpenChange,
  videoIds,
}: AddToPlaylistDialogProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isBulkAdd = videoIds.length > 1;

  useEffect(() => {
    if (isOpen && videoIds.length > 0) {
      setIsLoading(true);
      db.getAllPlaylists().then(allPlaylists => {
        setPlaylists(allPlaylists);
        // For single video add, pre-select playlists it's already in.
        // For bulk add, start with no playlists selected.
        if (!isBulkAdd) {
            const initialSelected = new Set<string>();
            allPlaylists.forEach(p => {
                if (p.videoIds.includes(videoIds[0])) {
                    initialSelected.add(p.id);
                }
            });
            setSelectedPlaylists(initialSelected);
        } else {
            setSelectedPlaylists(new Set());
        }
      }).finally(() => setIsLoading(false));
    }
  }, [isOpen, videoIds, isBulkAdd]);

  const handleCheckedChange = (playlistId: string, checked: boolean | 'indeterminate') => {
    setSelectedPlaylists(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(playlistId);
      } else {
        newSet.delete(playlistId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      const selectedPlaylistIds = Array.from(selectedPlaylists);
      
      // Bulk add to selected playlists
      for (const playlistId of selectedPlaylistIds) {
        for (const videoId of videoIds) {
          // This function is idempotent, so it won't add duplicates
          await db.addVideoToPlaylist(playlistId, videoId);
        }
      }

      // If it's not bulk add, we might need to handle removals from deselected playlists
      if (!isBulkAdd) {
         const videoId = videoIds[0];
         const originalSelectedIds = playlists.filter(p => p.videoIds.includes(videoId)).map(p => p.id);
         for (const playlistId of originalSelectedIds) {
           if (!selectedPlaylists.has(playlistId)) {
             await db.removeVideoFromPlaylist(playlistId, videoId);
           }
         }
      }


      toast({
        title: 'Success',
        description: 'Playlists updated successfully.',
      });
      onOpenChange(false, true);
    } catch (error) {
      console.error("Failed to update playlists:", error);
      toast({
        title: 'Error',
        description: 'Could not update playlists. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const title = isBulkAdd ? `Add ${videoIds.length} Videos to Playlists` : 'Add to Playlist';
  const description = isBulkAdd 
    ? 'Select the playlists you want to add the selected videos to.'
    : 'Select the playlists you want this video to be in.';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-64 pr-4">
          <div className="space-y-4 my-4">
            {isLoading ? (
              <p>Loading playlists...</p>
            ) : playlists.length > 0 ? (
              playlists.map(playlist => (
                <div key={playlist.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`playlist-${playlist.id}`}
                    checked={selectedPlaylists.has(playlist.id)}
                    onCheckedChange={(checked) => handleCheckedChange(playlist.id, checked)}
                  />
                  <Label htmlFor={`playlist-${playlist.id}`} className="font-normal w-full cursor-pointer">
                    {playlist.name}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No playlists found. Create one first!</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={playlists.length === 0}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
