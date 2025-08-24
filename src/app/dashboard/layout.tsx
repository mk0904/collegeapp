
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
];

const projectsNav = {
    icon: FolderKanban,
    label: 'Projects',
    subItems: [
        { href: '/dashboard/projects', label: 'All Projects' },
        { href: '/dashboard/projects/add', label: 'Add Project' },
        { href: '/dashboard/colleges/add', label: 'Add College' },
    ]
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
  const isProjectsPath = pathname.startsWith('/dashboard/projects') || pathname.startsWith('/dashboard/colleges/add');
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(isProjectsPath);

  React.useEffect(() => {
    if (isProjectsPath) {
        setIsProjectsOpen(true);
    }
  }, [isProjectsPath]);

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

  return (
    <div className="bg-gradient-to-br from-blue-50/50 via-green-50/50 to-blue-100/50 min-h-screen">
        <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="border-b-0 p-0">
            <div className="flex items-center justify-between p-2 h-20">
                <div className="group-data-[collapsible=icon]:hidden">
                    <Logo onDarkBg={true} />
                </div>
                <SidebarTrigger className="hidden group-data-[collapsible=icon]:block" />
            </div>
            </SidebarHeader>
            <SidebarContent>
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
                    >
                    <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}

                <SidebarSeparator />

                <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen} asChild>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            className="justify-between"
                            isActive={isProjectsPath}
                            tooltip={{ children: projectsNav.label }}
                        >
                            <div className="flex items-center gap-3">
                                <projectsNav.icon />
                                <span>{projectsNav.label}</span>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isProjectsOpen && "rotate-180")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {projectsNav.subItems.map(item => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                                    <Link href={item.href}>{item.label}</Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
                </SidebarMenuItem>
                </Collapsible>
                
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(helpdeskNavItem.href)}
                        tooltip={{ children: helpdeskNavItem.label }}
                    >
                        <Link href={helpdeskNavItem.href}>
                            <helpdeskNavItem.icon />
                            <span>{helpdeskNavItem.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>

            </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            <SidebarSeparator />
            <SidebarMenu>
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(accountNavItem.href)}
                    tooltip={{ children: accountNavItem.label }}
                >
                    <Link href={accountNavItem.href}>
                    <accountNavItem.icon />
                    <span>{accountNavItem.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-transparent px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                <SidebarTrigger className="md:hidden" />
                <div className="w-full flex-1">
                {/* Optional: Add search to header */}
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full h-8 w-8">
                    <UserCircle className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard/account">Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/helpdesk">Support</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
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
