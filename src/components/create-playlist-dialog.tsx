
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from './ui/textarea';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import type { Playlist } from '@/lib/types';

interface CreatePlaylistDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPlaylistCreated: (playlist: Playlist) => void;
  playlistToEdit?: Playlist;
}

export function CreatePlaylistDialog({
  isOpen,
  onOpenChange,
  onPlaylistCreated,
  playlistToEdit
}: CreatePlaylistDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  useState(() => {
    if (playlistToEdit) {
      setName(playlistToEdit.name);
      setDescription(playlistToEdit.description);
    } else {
      setName('');
      setDescription('');
    }
  });
  
  // Effect to update form when playlistToEdit changes or dialog opens
  // This handles both creating a new playlist and editing an existing one
  useState(() => {
    if (isOpen) {
      if (playlistToEdit) {
        setName(playlistToEdit.name);
        setDescription(playlistToEdit.description);
      } else {
        setName('');
        setDescription('');
      }
    }
  });


  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Playlist name is required.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
        if(playlistToEdit) {
            const updatedPlaylist = { ...playlistToEdit, name, description };
            await db.updatePlaylist(updatedPlaylist);
            onPlaylistCreated(updatedPlaylist); // Re-use this to trigger refresh
            toast({
                title: 'Playlist Updated',
                description: `"${name}" has been updated.`,
            });
        } else {
            const newPlaylist = await db.createPlaylist(name, description);
            onPlaylistCreated(newPlaylist);
            toast({
                title: 'Playlist Created',
                description: `"${name}" has been added to your playlists.`,
            });
        }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create/update playlist:", error);
      toast({
        title: 'Error',
        description: `Could not ${playlistToEdit ? 'update' : 'create'} playlist. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const title = playlistToEdit ? 'Edit Playlist' : 'Create New Playlist';
  const desc = playlistToEdit ? 'Update the details for your playlist.' : 'Give your new playlist a name and an optional description.';
  const buttonText = playlistToEdit ? 'Save Changes' : 'Create Playlist';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 'My Favorite Vlogs'"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 'A collection of the best vlogging content.'"
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button onClick={handleSubmit}>{buttonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
