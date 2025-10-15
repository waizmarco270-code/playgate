
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, FolderKanban, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '../ui/sidebar';

const BottomNav = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/playlists', label: 'Playlists', icon: FolderKanban },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    setOpenMobile(false);
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
      </div>
    </nav>
  );
};

export default BottomNav;
