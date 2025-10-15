'use client';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { HardDriveDownload, HardDriveUpload, Trash2 } from 'lucide-react';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();

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

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b">
                <h1 className="text-2xl font-bold">Settings</h1>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the app.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="theme">Theme</Label>
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
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Manage your local application data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Export Data</h3>
                                    <p className="text-sm text-muted-foreground">Save your playlists and video metadata to a JSON file.</p>
                                </div>
                                <Button variant="outline" disabled>
                                    <HardDriveDownload className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Import Data</h3>
                                    <p className="text-sm text-muted-foreground">Load data from a previously exported JSON file.</p>
                                </div>
                                <Button variant="outline" disabled>
                                    <HardDriveUpload className="mr-2 h-4 w-4" />
                                    Import
                                </Button>
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
