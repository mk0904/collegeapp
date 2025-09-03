'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  FolderKanban,
  LifeBuoy,
  UserCircle,
  Bell,
  ChevronDown,
  FileText,
  LogOut,
  Search, // Added for search icon
  Calendar,
} from 'lucide-react';
import * as React from 'react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
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
    { href: '/dashboard/attendance', icon: Calendar, label: 'Attendance' },
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
  const [activeSection, setActiveSection] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      const section = localStorage.getItem('activeSection');
      return section || 'dashboard';
    }
    return 'dashboard';
  });
  
  // Add state for current user
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

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
  
  // Fetch current user data
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          // Import dynamically to avoid circular dependencies
          const { getUserById } = await import('@/lib/firebase/firestore');
          const userData = await getUserById(authUser.uid);
          setCurrentUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // If not logged in, redirect to login
        router.push('/login');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen">
        <SidebarProvider>
                <Sidebar
          className="border-r bg-primary shadow-lg transition-all duration-700 ease-out min-w-[280px] group-data-[state=collapsed]:min-w-[64px] !bg-primary z-20"
          collapsible="icon"
        >
            <SidebarHeader className="border-b border-white/20 p-0 !bg-primary">
                        <div className="flex items-center justify-between p-4 h-16">
                <div className="flex items-center gap-3 group-data-[state=collapsed]:justify-center">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 group-data-[state=collapsed]:hidden">
                        <span className="text-primary font-bold text-sm">C</span>
                    </div>
                    <span className="text-white font-semibold text-lg group-data-[state=collapsed]:hidden">College App</span>
                </div>
                <SidebarTrigger className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 hover:bg-white/90 transition-all duration-300 opacity-100 group-data-[state=collapsed]:opacity-100 group-data-[state=expanded]:opacity-100">
                    <ChevronDown className="h-4 w-4 text-primary transition-transform duration-300 ease-out rotate-90 group-data-[state=expanded]:rotate-[-90deg]" />
                </SidebarTrigger>
            </div>
            </SidebarHeader>
            <SidebarContent className="p-2 group-data-[state=collapsed]:p-1 !bg-primary">
                          <div className="px-2 py-2 group-data-[state=collapsed]:hidden">
                <p className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">Main Menu</p>
              </div>
            <SidebarMenu>
                {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                    asChild
                    isActive={
                        item.href === '/dashboard'
                        ? pathname === item.href
                        : pathname.startsWith(item.href)
                    }
                    tooltip={{ children: item.label }}
                    className={cn(
                      "flex gap-3 items-center px-6 py-2.5 rounded-lg transition-all duration-700 ease-out w-full mb-1 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-1 group-data-[state=collapsed]:w-12 group-data-[state=collapsed]:h-12 w-12 h-12 px-1 justify-start",
                      (item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href))
                        ? "bg-white text-primary shadow-sm hover:bg-white hover:text-primary"
                        : "text-white hover:text-white/90 hover:bg-white/10"
                    )}
                    >
                    <Link href={item.href} className="flex gap-3 items-center w-full group-data-[state=collapsed]:justify-center justify-start">
                        <span className={cn(
                          "transition-colors shrink-0 flex items-center justify-center",
                          (item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href))
                            ? "text-primary"
                            : "text-white group-data-[state=collapsed]:text-white",
                          "group-data-[state=collapsed]:p-0"
                        )}>
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className={cn(
                          "font-medium transition-all duration-700 ease-out whitespace-nowrap",
                          (item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href))
                            ? "text-primary font-semibold"
                            : "text-white",
                          "group-data-[state=collapsed]:hidden"
                        )}>{item.label}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}

                <SidebarSeparator className="my-3 group-data-[state=collapsed]:my-2 border-white/20" />
                
                                  <div className="px-2 py-2 group-data-[state=collapsed]:hidden">
                    <p className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">Workspace</p>
                  </div>
                
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(projectsNav.href)}
                        tooltip={{ children: projectsNav.label }}
                        className={cn(
                          "flex gap-3 items-center px-6 py-2.5 rounded-lg transition-all duration-700 ease-out mb-1 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-1 group-data-[state=collapsed]:w-12 group-data-[state=collapsed]:h-12 w-12 h-12 px-1 justify-start",
                          pathname.startsWith(projectsNav.href)
                            ? "bg-white text-primary shadow-sm hover:bg-white hover:text-primary"
                            : "text-white hover:text-white/90 hover:bg-white/10"
                        )}
                    >
                        <Link href={projectsNav.href} className="flex gap-3 items-center w-full group-data-[state=collapsed]:justify-center justify-start">
                            <span className={cn(
                              "transition-colors shrink-0 flex items-center justify-center",
                              pathname.startsWith(projectsNav.href)
                                ? "text-primary"
                                : "text-white group-data-[state=collapsed]:text-white",
                              "group-data-[state=collapsed]:p-0"
                            )}>
                              <projectsNav.icon className="h-4 w-4" />
                            </span>
                            <span className={cn(
                              "font-medium transition-all duration-700 ease-out whitespace-nowrap",
                              pathname.startsWith(projectsNav.href)
                                ? "text-primary font-semibold"
                                : "text-white",
                              "group-data-[state=collapsed]:hidden"
                            )}>{projectsNav.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(helpdeskNavItem.href)}
                        tooltip={{ children: helpdeskNavItem.label }}
                        className={cn(
                          "flex gap-3 items-center px-6 py-2.5 rounded-lg transition-all duration-700 ease-out mb-1 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-1 group-data-[state=collapsed]:w-12 group-data-[state=collapsed]:h-12 w-12 h-12 px-1 justify-start",
                          pathname.startsWith(helpdeskNavItem.href)
                            ? "bg-white text-primary shadow-sm hover:bg-white hover:text-primary"
                            : "text-white hover:text-white/90 hover:bg-white/10"
                        )}
                    >
                        <Link href={helpdeskNavItem.href} className="flex gap-3 items-center w-full group-data-[state=collapsed]:justify-center justify-start">
                            <span className={cn(
                              "transition-colors shrink-0 flex items-center justify-center",
                              pathname.startsWith(helpdeskNavItem.href)
                                ? "text-primary"
                                : "text-white group-data-[state=collapsed]:text-white",
                              "group-data-[state=collapsed]:p-0"
                            )}>
                              <helpdeskNavItem.icon className="h-4 w-4" />
                            </span>
                            <span className={cn(
                              "font-medium transition-all duration-700 ease-out whitespace-nowrap",
                              pathname.startsWith(helpdeskNavItem.href)
                                ? "text-primary font-semibold"
                                : "text-white",
                              "group-data-[state=collapsed]:hidden"
                            )}>{helpdeskNavItem.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>

            </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t border-white/20 p-2 group-data-[state=collapsed]:p-1 !bg-primary">
                          <div className="px-2 py-2 group-data-[state=collapsed]:hidden">
                <p className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">Account</p>
              </div>
            <SidebarMenu>
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(accountNavItem.href)}
                    tooltip={{ children: accountNavItem.label }}
                    className={cn(
                      "flex gap-3 items-center px-6 py-2.5 rounded-lg transition-all duration-700 ease-out mb-1 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-1 group-data-[state=collapsed]:w-12 group-data-[state=collapsed]:h-12 w-12 h-12 px-1 justify-start",
                      pathname.startsWith(accountNavItem.href)
                        ? "bg-white text-primary shadow-sm hover:bg-white hover:text-primary"
                        : "text-white hover:text-white/90 hover:bg-white/10"
                    )}
                >
                    <Link href={accountNavItem.href} className="flex gap-3 items-center w-full group-data-[state=collapsed]:justify-center justify-start">
                        <span className={cn(
                          "transition-colors shrink-0 flex items-center justify-center",
                          pathname.startsWith(accountNavItem.href)
                            ? "text-primary"
                            : "text-white group-data-[state=collapsed]:text-white",
                          "group-data-[state=collapsed]:p-0"
                        )}>
                          <accountNavItem.icon className="h-4 w-4" />
                        </span>
                        <span className={cn(
                          "font-medium transition-all duration-700 ease-out whitespace-nowrap",
                          pathname.startsWith(accountNavItem.href)
                            ? "text-primary font-semibold"
                            : "text-white",
                          "group-data-[state=collapsed]:hidden"
                        )}>{accountNavItem.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip={{ children: "Logout" }}
                    onClick={handleLogout}
                    className="flex gap-3 items-center px-6 py-2.5 rounded-lg transition-all duration-700 ease-out text-white hover:text-white/90 hover:bg-white/10 mb-1 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-1 group-data-[state=collapsed]:w-12 group-data-[state=collapsed]:h-12 w-12 h-12 px-1 justify-start"
                >
                    <span className="text-white group-data-[state=collapsed]:p-0">
                      <LogOut className="h-4 w-4" />
                    </span>
                    <span className="font-medium group-data-[state=collapsed]:hidden">Logout</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col">
            <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6 sticky top-0 z-10 shadow-sm">
                <SidebarTrigger className="h-9 w-9 flex items-center justify-center border border-slate-200 bg-white rounded-md shadow-sm hover:bg-slate-50 transition-colors lg:hidden" />
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
                  {/* Notification Bell */}
                  <NotificationBell userId={currentUser?.id || "admin"} />
                  
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
                          <p className="font-medium">{currentUser?.name || "Admin User"}</p>
                          <p className="text-xs text-muted-foreground">{currentUser?.email || "admin@example.com"}</p>
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
            <main className="flex-1 p-4 lg:p-6 pl-6 lg:pl-8 bg-transparent">
                {children}
            </main>
            </div>
        </SidebarInset>
        </SidebarProvider>
    </div>
  );
}
