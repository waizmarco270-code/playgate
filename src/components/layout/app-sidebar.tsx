
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
import { Home, Settings, FolderKanban, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../theme-toggle';
import Image from 'next/image';
import { motion } from 'framer-motion';

const AppSidebar = () => {
  const pathname = usePathname();

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
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
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

      <SidebarFooter className="p-4">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
