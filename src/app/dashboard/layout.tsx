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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/users', icon: Users, label: 'Users' },
    { href: '/dashboard/circular', icon: FileText, label: 'Circular' },
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

  return (
    <div className="bg-gradient-to-br from-blue-50/50 via-green-50/50 to-blue-100/50 min-h-screen">
        <SidebarProvider>
        <Sidebar variant="inset" className="border-r bg-white shadow-sm">
            <SidebarHeader className="border-b p-0">
            <div className="flex items-center justify-between p-4 h-20">
                <div className="flex items-center w-full">
                    <Logo onDarkBg={false} />
                </div>
            </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">MAIN NAVIGATION</p>
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
                    className={cn(
                      "flex gap-3 items-center px-3 py-2.5 rounded-md transition-colors w-full",
                      (item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href))
                        ? "bg-primary text-white"
                        : "hover:bg-primary/10"
                    )}
                    >
                    <Link href={item.href} className="flex gap-3 items-center w-full">
                        <span className={cn(
                          "p-1.5 rounded-md transition-colors",
                          (item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href))
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        )}>
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className={cn(
                          "font-medium transition-colors",
                          (item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href))
                            ? "font-semibold"
                            : ""
                        )}>{item.label}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}

                <SidebarSeparator className="my-3" />
                
                <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">WORKSPACE</p>
                </div>
                
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(projectsNav.href)}
                        tooltip={{ children: projectsNav.label }}
                        className={cn(
                          "flex gap-3 items-center px-3 py-2.5 rounded-md transition-colors",
                          pathname.startsWith(projectsNav.href)
                            ? "bg-primary text-white"
                            : "hover:bg-primary/10"
                        )}
                    >
                        <Link href={projectsNav.href} className="flex gap-3 items-center w-full">
                            <span className={cn(
                              "p-1.5 rounded-md transition-colors",
                              pathname.startsWith(projectsNav.href)
                                ? "bg-primary text-white"
                                : "bg-primary/10 text-primary"
                            )}>
                              <projectsNav.icon className="h-4 w-4" />
                            </span>
                            <span className={cn(
                              "font-medium transition-colors",
                              pathname.startsWith(projectsNav.href)
                                ? "font-semibold"
                                : ""
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
                          "flex gap-3 items-center px-3 py-2.5 rounded-md transition-colors",
                          pathname.startsWith(helpdeskNavItem.href)
                            ? "bg-primary text-white"
                            : "hover:bg-primary/10"
                        )}
                    >
                        <Link href={helpdeskNavItem.href} className="flex gap-3 items-center w-full">
                            <span className={cn(
                              "p-1.5 rounded-md transition-colors",
                              pathname.startsWith(helpdeskNavItem.href)
                                ? "bg-primary text-white"
                                : "bg-primary/10 text-primary"
                            )}>
                              <helpdeskNavItem.icon className="h-4 w-4" />
                            </span>
                            <span className={cn(
                              "font-medium transition-colors",
                              pathname.startsWith(helpdeskNavItem.href)
                                ? "font-semibold"
                                : ""
                            )}>{helpdeskNavItem.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>

            </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-2">
            <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
              <p className="text-xs font-semibold text-muted-foreground mb-2">ACCOUNT</p>
            </div>
            <SidebarMenu>
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(accountNavItem.href)}
                    tooltip={{ children: accountNavItem.label }}
                    className={cn(
                      "flex gap-3 items-center px-3 py-2.5 rounded-md transition-colors",
                      pathname.startsWith(accountNavItem.href)
                        ? "bg-primary text-white"
                        : "hover:bg-primary/10"
                    )}
                >
                    <Link href={accountNavItem.href} className="flex gap-3 items-center w-full">
                        <span className={cn(
                          "p-1.5 rounded-md transition-colors",
                          pathname.startsWith(accountNavItem.href)
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        )}>
                          <accountNavItem.icon className="h-4 w-4" />
                        </span>
                        <span className={cn(
                          "font-medium transition-colors",
                          pathname.startsWith(accountNavItem.href)
                            ? "font-semibold"
                            : ""
                        )}>{accountNavItem.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip={{ children: "Logout" }}
                    onClick={handleLogout}
                    className="flex gap-3 items-center px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-red-500"
                >
                    <span className="bg-red-100 p-1.5 rounded-md text-red-500">
                      <LogOut className="h-4 w-4" />
                    </span>
                    <span className="font-medium">Logout</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col">
            <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
                <SidebarTrigger className="h-9 w-9 flex items-center justify-center border border-slate-200 bg-white rounded-md shadow-sm hover:bg-slate-50" />
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
        </SidebarInset>
        </SidebarProvider>
    </div>
  );
}
