'use client';
import { FolderKanban } from "lucide-react";

export default function PlaylistsPage() {
  return (
    <div className="flex flex-col h-full">
        <header className="p-4 border-b">
            <h1 className="text-2xl font-bold">Playlists</h1>
        </header>
        <main className="flex-1 p-6 flex items-center justify-center">
             <div className="text-center">
                <div className="p-6 rounded-full bg-secondary mb-4 inline-block">
                    <FolderKanban className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold">Coming Soon</h2>
                <p className="mt-2 text-muted-foreground">Playlist management is under construction.</p>
            </div>
        </main>
    </div>
  );
}
