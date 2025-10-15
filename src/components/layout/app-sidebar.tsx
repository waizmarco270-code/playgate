
'use client';

import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Home, Settings, FolderKanban, ShieldCheck, Share2 } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../theme-toggle';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const AppSidebar = () => {
  const pathname = usePathname();
  const { toast } = useToast();

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
      // Fallback for browsers that don't support Web Share API
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

  const menuItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/playlists',
      label: 'Playlists',
      icon: FolderKanban,
    },
    {
        href: '/vault',
        label: 'Vault',
        icon: ShieldCheck,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="PlayGate Logo" width={32} height={32} className="rounded-full" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight">PlayGate</h2>
            <p className="text-xs text-muted-foreground">Your Offline Video Universe</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  variant={isActive ? 'primary' : 'ghost'}
                  className="relative"
                  tooltip={{
                    children: item.label,
                    className: 'dark:bg-sidebar-accent',
                  }}
                >
                  <Link href={item.href}>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-lg -z-10"
                        style={{ borderRadius: 8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-1">
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                  variant="ghost"
                  className="relative"
                  tooltip={{
                    children: "Share App",
                    className: 'dark:bg-sidebar-accent',
                  }}
                  onClick={handleShare}
                >
                    <Share2 />
                    <span>Share App</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <SidebarMenuButton
                  asChild
                  isActive={pathname === '/settings'}
                   variant={pathname === '/settings' ? 'primary' : 'ghost'}
                  className="relative"
                  tooltip={{
                    children: "Settings",
                    className: 'dark:bg-sidebar-accent',
                  }}
                >
                  <Link href="/settings">
                    {pathname === '/settings' && (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-lg -z-10"
                        style={{ borderRadius: 8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
