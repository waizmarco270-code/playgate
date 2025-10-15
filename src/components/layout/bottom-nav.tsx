
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, FolderKanban, Settings, ShieldCheck, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

const BottomNav = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { toast } = useToast();

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/playlists', label: 'Playlists', icon: FolderKanban },
    { href: '/vault', label: 'Vault', icon: ShieldCheck },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  const handleShare = async () => {
    const shareData = {
      title: 'PlayGate - Your Offline Video Universe',
      text: 'Check out PlayGate! A privacy-focused PWA to watch your local videos anywhere, completely offline.',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Link Copied!',
          description: 'App link copied to your clipboard.',
        });
      } catch (err) {
        console.error('Failed to copy link:', err);
        toast({
          title: 'Error',
          description: 'Could not copy link to clipboard.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur-sm">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={handleLinkClick}>
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-20 h-full transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-1 w-20 h-full transition-colors',
                'text-muted-foreground hover:text-foreground'
            )}
            onClick={handleShare}
            >
            <Share2 className="w-6 h-6" />
            <span className="text-xs font-medium">Share</span>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
