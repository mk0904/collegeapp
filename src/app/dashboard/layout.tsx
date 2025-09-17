'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, FolderKanban, LifeBuoy, UserCircle, Bell, ChevronDown, FileText, LogOut, Search, PanelLeft, CalendarDays, University } from 'lucide-react';
import * as React from 'react';

// Replaced complex sidebar with a simple icon-only rail
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/logo';
import { NotificationBell } from '@/components/notification-bell';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/users', icon: Users, label: 'Users' },
    { href: '/dashboard/circular', icon: FileText, label: 'Circular' },
    { href: '/dashboard/attendance', icon: CalendarDays, label: 'Attendance' },
    { href: '/dashboard/colleges', icon: University as any, label: 'Colleges' },
];

const projectsNav = {
    icon: FolderKanban,
    label: 'Projects',
    href: '/dashboard/projects',
}

const helpdeskNavItem = { href: '/dashboard/helpdesk', icon: LifeBuoy, label: 'Helpdesk' };
const accountNavItem = { href: '/dashboard/account', icon: UserCircle, label: 'Account' };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [expanded, setExpanded] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('sidebar_expanded');
      return v === 'true';
    }
    return false;
  });
  const [activeSection, setActiveSection] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      const section = localStorage.getItem('activeSection');
      return section || 'dashboard';
    }
    return 'dashboard';
  });

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({ title: 'Error', description: 'Failed to log out. Please try again.', variant: 'destructive' });
    }
  };

  // Set active section based on pathname
  React.useEffect(() => {
    const section = pathname.split('/')[2] || 'dashboard';
    setActiveSection(section);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeSection', section);
    }
  }, [pathname]);

  // Get current user
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') localStorage.setItem('sidebar_expanded', String(next));
      return next;
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/50 via-green-50/50 to-blue-100/50 min-h-screen">
        {/* Collapsible icon rail */}
        <aside className={cn("fixed inset-y-0 left-0 z-20 border-r bg-white flex flex-col py-4 gap-2 transition-[width] duration-200 ease-linear", expanded ? "w-64" : "w-16")}> 
          <div className={cn("px-3 flex items-center", expanded ? "justify-between" : "justify-center")}> 
            {expanded && (
              <div className="h-10 flex items-center">
                <Logo onDarkBg={false} />
              </div>
            )}
            <button onClick={toggleExpanded} className="h-8 w-8 flex items-center justify-center rounded-md border bg-white hover:bg-slate-50">
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col mt-2">
            {[...navItems, { href: projectsNav.href, icon: projectsNav.icon, label: projectsNav.label }, { href: helpdeskNavItem.href, icon: helpdeskNavItem.icon, label: helpdeskNavItem.label }].map((item) => {
              const active = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon as any;
              return (
                <Link key={item.href} href={item.href} className={cn("mx-3 my-1 h-10 rounded-xl flex items-center gap-3 px-2 transition-colors", active ? "bg-primary text-white" : "text-primary hover:bg-primary/10")}> 
                  <span className="h-10 w-10 flex items-center justify-center"><Icon className="h-5 w-5" /></span>
                  <span className={cn("text-sm font-medium whitespace-nowrap", !expanded && "hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-col gap-2 px-3 mb-2">
            <Link href={accountNavItem.href} className={cn("h-10 rounded-xl flex items-center gap-3 px-2 transition-colors", pathname.startsWith(accountNavItem.href) ? "bg-primary text-white" : "text-primary hover:bg-primary/10")}> 
              <span className="h-10 w-10 flex items-center justify-center"><accountNavItem.icon className="h-5 w-5" /></span>
              <span className={cn("text-sm font-medium whitespace-nowrap", !expanded && "hidden")}>{accountNavItem.label}</span>
            </Link>
            <button onClick={handleLogout} className="h-10 rounded-xl flex items-center gap-3 px-2 text-red-500 hover:bg-red-50">
              <span className="h-10 w-10 flex items-center justify-center"><LogOut className="h-5 w-5" /></span>
              <span className={cn("text-sm font-medium whitespace-nowrap", !expanded && "hidden")}>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main area with left margin equal to rail width */}
        <div className={cn(expanded ? "ml-64" : "ml-16")}> 
            <div className="flex flex-col">
            <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
                <div className="w-full flex-1">
                  <nav className="flex items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-1 bg-primary rounded-full mr-3 hidden md:block"></div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dashboard</p>
                        <h1 className="text-xl font-bold capitalize text-gray-800 dark:text-gray-100">{activeSection}</h1>
                      </div>
                    </div>
                  </nav>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  {currentUser && <NotificationBell userId={currentUser.uid} />}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 overflow-hidden p-0 bg-white/90 shadow-sm hover:bg-white">
                        <UserCircle className="h-6 w-6 text-primary" />
                        <span className="sr-only">User menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center gap-3 p-2">
                        <div className="bg-primary/10 p-1 rounded-full">
                          <UserCircle className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Admin User</p>
                          <p className="text-xs text-muted-foreground">admin@example.com</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/account" className="flex items-center cursor-pointer">
                          <UserCircle className="h-4 w-4 mr-2" />Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/helpdesk" className="flex items-center cursor-pointer">
                          <LifeBuoy className="h-4 w-4 mr-2" />Support
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleLogout} className="text-red-500 cursor-pointer flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
            </header>
            <main className="flex-1 p-4 lg:p-6 bg-transparent">
                {children}
            </main>
            </div>
        </div>
    </div>
  );
}
