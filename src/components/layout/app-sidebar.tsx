
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
          <Image src="https://picsum.photos/seed/logo/32/32" alt="PlayGate Logo" width={32} height={32} className="rounded-full" data-ai-hint="logo abstract" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight">PlayGate</h2>
            <p className="text-xs text-muted-foreground">Your Offline Video Universe</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{
                  children: item.label,
                  className: 'dark:bg-sidebar-accent',
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
