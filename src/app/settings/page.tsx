
'use client';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { HardDriveDownload, HardDriveUpload, Trash2, ShieldCheck, Database, KeyRound, Download } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const importInputRef = useRef<HTMLInputElement>(null);
    
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
      const handleBeforeInstallPrompt = (event: Event) => {
        event.preventDefault();
        const typedEvent = event as BeforeInstallPromptEvent;
        
        if (window.matchMedia('(display-mode: standalone)').matches) {
          return;
        }
        
        setInstallPromptEvent(typedEvent);
        setCanInstall(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }, []);

    const handleInstallClick = async () => {
      if (!installPromptEvent) return;
      try {
        await installPromptEvent.prompt();
        const { outcome } = await installPromptEvent.userChoice;
        if (outcome === 'accepted') {
          toast({
              title: "Installation Complete!",
              description: "PlayGate has been added to your home screen."
          });
        }
        setCanInstall(false);
      } catch (error) {
          toast({
              title: "Installation Failed",
              description: "Something went wrong during installation.",
              variant: "destructive"
          });
      } finally {
          setInstallPromptEvent(null);
      }
    };

    const handleReset = async () => {
        if(confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
            try {
                await db.clearDB();
                toast({
                    title: "Storage Reset",
                    description: "All your local data has been cleared.",
                });
                // Optionally, refresh or redirect
                window.location.href = '/';
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Could not reset storage. Please try again.",
                    variant: "destructive",
                });
            }
        }
    }

    const handleExport = async () => {
        try {
            const data = await db.exportData();
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
            const link = document.createElement('a');
            link.href = jsonString;
            link.download = `playgate_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            toast({
                title: "Export Successful",
                description: "Your data has been exported.",
            });
        } catch (error) {
            console.error("Export failed:", error);
            toast({
                title: "Export Failed",
                description: "Could not export your data.",
                variant: "destructive"
            });
        }
    }

    const handleImportClick = () => {
        importInputRef.current?.click();
    }
    
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read");
                }
                const data = JSON.parse(text);
                await db.importData(data);
                toast({
                    title: "Import Successful",
                    description: "Your data has been restored. The app will now reload.",
                });
                // Reload to reflect changes everywhere
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                 console.error("Import failed:", error);
                toast({
                    title: "Import Failed",
                    description: "The backup file is invalid or corrupted.",
                    variant: "destructive"
                });
            } finally {
                // Reset file input
                if(importInputRef.current) importInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    }


    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the app.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="theme" className="flex-1">Theme</Label>
                                <Select onValueChange={setTheme} value={theme}>
                                    <SelectTrigger id="theme" className="w-[180px]">
                                        <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1" className="border-b-0">
                                <AccordionTrigger className="p-6 hover:no-underline">
                                     <CardHeader className="p-0 text-left">
                                        <CardTitle>Privacy & Security</CardTitle>
                                        <CardDescription>How your data is stored and secured.</CardDescription>
                                    </CardHeader>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <CardContent className="space-y-4 pt-0">
                                        <div className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/30">
                                            <Database className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
                                            <div>
                                                <h3 className="font-semibold">100% Local Data Storage</h3>
                                                <p className="text-sm text-muted-foreground">All your data, including video files, playlists, and metadata, is stored exclusively on your device using your browser's IndexedDB. Nothing is ever uploaded to a server, ensuring your privacy is completely protected.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/30">
                                            <ShieldCheck className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
                                            <div>
                                                <h3 className="font-semibold">Secure Vault Encryption</h3>
                                                <p className="text-sm text-muted-foreground">Videos moved to the Vault are encrypted. Your Vault password is used to generate a key that encrypts this data. The password is only stored as a secure hash on your device.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/30">
                                            <KeyRound className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
                                            <div>
                                                <h3 className="font-semibold">Password Recovery</h3>
                                                <p className="text-sm text-muted-foreground">Because your password is not stored on any server, it cannot be traditionally recovered. If you forget it, you must use the "Reset Password" feature, which requires contacting the developer with a unique support code to get an unlock key. **Store your password safely!**</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Manage your local application data and installation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {canInstall && (
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">Install App</h3>
                                        <p className="text-sm text-muted-foreground">Install PlayGate on your device for a native app experience.</p>
                                    </div>
                                    <Button variant="outline" onClick={handleInstallClick}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Install
                                    </Button>
                                </div>
                            )}
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Export Data</h3>
                                    <p className="text-sm text-muted-foreground">Save your playlists and video metadata to a JSON file.</p>
                                </div>
                                <Button variant="outline" onClick={handleExport}>
                                    <HardDriveDownload className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Import Data</h3>
                                    <p className="text-sm text-muted-foreground">Load data from a previously exported JSON file.</p>
                                </div>
                                <Button variant="outline" onClick={handleImportClick}>
                                    <HardDriveUpload className="mr-2 h-4 w-4" />
                                    Import
                                </Button>
                                <input 
                                    type="file" 
                                    ref={importInputRef} 
                                    className="hidden" 
                                    accept="application/json"
                                    onChange={handleImport}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle>Danger Zone</CardTitle>
                            <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                                <div>
                                    <h3 className="font-semibold text-destructive">Reset Storage</h3>
                                    <p className="text-sm text-destructive/80">Delete all imported videos and playlists from your device.</p>
                                </div>
                                <Button variant="destructive" onClick={handleReset}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
