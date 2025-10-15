
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
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export function AddToPlaylistDialog({
  isOpen,
  onOpenChange,
  videoId,
}: AddToPlaylistDialogProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      db.getAllPlaylists().then(allPlaylists => {
        setPlaylists(allPlaylists);
        const initialSelected = new Set<string>();
        allPlaylists.forEach(p => {
          if (p.videoIds.includes(videoId)) {
            initialSelected.add(p.id);
          }
        });
        setSelectedPlaylists(initialSelected);
      }).finally(() => setIsLoading(false));
    }
  }, [isOpen, videoId]);

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
      // Add to selected playlists
      for (const playlistId of Array.from(selectedPlaylists)) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist && !playlist.videoIds.includes(videoId)) {
          await db.addVideoToPlaylist(playlistId, videoId);
        }
      }

      // Remove from deselected playlists
      const originalSelectedIds = playlists.filter(p => p.videoIds.includes(videoId)).map(p => p.id);
      for (const playlistId of originalSelectedIds) {
        if (!selectedPlaylists.has(playlistId)) {
          await db.removeVideoFromPlaylist(playlistId, videoId);
        }
      }

      toast({
        title: 'Success',
        description: 'Playlists updated successfully.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update playlists:", error);
      toast({
        title: 'Error',
        description: 'Could not update playlists. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Select the playlists you want to add this video to.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-64 pr-4">
          <div className="space-y-4 my-4">
            {isLoading ? (
              <p>Loading playlists...</p>
            ) : playlists.length > 0 ? (
              playlists.map(playlist => (
                <div key={playlist.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={playlist.id}
                    checked={selectedPlaylists.has(playlist.id)}
                    onCheckedChange={(checked) => handleCheckedChange(playlist.id, checked)}
                  />
                  <Label htmlFor={playlist.id} className="font-normal w-full cursor-pointer">
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
