
'use client';

import { useState, useEffect } from 'react';
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
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import type { VideoFile } from '@/lib/types';

interface RenameVideoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  video: VideoFile;
  onVideoRenamed: (video: VideoFile) => void;
}

export function RenameVideoDialog({
  isOpen,
  onOpenChange,
  video,
  onVideoRenamed
}: RenameVideoDialogProps) {
  const [name, setName] = useState(video.name);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(video.name);
    }
  }, [isOpen, video.name]);

  const handleSubmit = async () => {
    const newName = name.trim();
    if (!newName) {
      toast({
        title: 'Validation Error',
        description: 'Video name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newName === video.name) {
      onOpenChange(false);
      return;
    }
    
    try {
      const updatedVideo = await db.updateVideoName(video.id, newName);
      onVideoRenamed(updatedVideo);
      toast({
        title: 'Video Renamed',
        description: 'The video name has been updated.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to rename video:", error);
      toast({
        title: 'Error',
        description: 'Could not rename video. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Video</DialogTitle>
          <DialogDescription>Enter a new name for your video.</DialogDescription>
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
              placeholder="Enter new video name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    