'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, FolderKanban, LifeBuoy, UserCircle, FileText, LogOut, PanelLeft, CalendarDays, University, BarChart3, ChevronRight } from 'lucide-react';
import * as React from 'react';

import Logo from '@/components/logo';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/users', icon: Users, label: 'Users' },
    { href: '/dashboard/circular', icon: FileText, label: 'Circular' },
    { href: '/dashboard/attendance', icon: CalendarDays, label: 'Attendance' },
    { href: '/dashboard/colleges', icon: University as any, label: 'Colleges' },
    { href: '/dashboard/enrollment', icon: BarChart3, label: 'Enrollment' },
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
  const [mounted, setMounted] = React.useState(false);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [hoverExpanded, setHoverExpanded] = React.useState<boolean>(false);

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

  // Initialize from localStorage after mount to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
    // Load sidebar expanded state from localStorage
    const savedExpanded = localStorage.getItem('sidebar_expanded');
    if (savedExpanded === 'true') {
      setExpanded(true);
    }
  }, []);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      if (mounted) {
        localStorage.setItem('sidebar_expanded', String(next));
      }
      return next;
    });
  };

  // Determine if sidebar should be shown as expanded (either by toggle or hover)
  const isSidebarExpanded = expanded || hoverExpanded;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/40 min-h-screen">
          {/* Enhanced Premium Sidebar */}
          <aside 
            className={cn(
              "fixed inset-y-0 left-0 z-20 border-r border-border/40 bg-gradient-to-b from-white via-white/95 to-slate-50/80 backdrop-blur-xl flex flex-col py-5 gap-3 transition-[width] duration-300 ease-out shadow-2xl",
              "before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:via-transparent before:to-transparent before:pointer-events-none",
              isSidebarExpanded ? "w-64" : "w-16"
            )}
            onMouseEnter={() => setHoverExpanded(true)}
            onMouseLeave={() => setHoverExpanded(false)}
          > 
            {/* Header Section */}
            <div className={cn("px-4 flex items-center relative z-10", isSidebarExpanded ? "justify-between" : "justify-center")}> 
              {mounted && isSidebarExpanded && (
                <div className="h-10 flex items-center animate-in fade-in slide-in-from-left-2 duration-300">
                  <Logo onDarkBg={false} />
                </div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={toggleExpanded} 
                    className="h-9 w-9 flex items-center justify-center rounded-xl border-2 border-primary/20 bg-gradient-to-br from-white to-slate-50 hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <PanelLeft className={cn("h-4 w-4 text-primary transition-transform duration-200", expanded && "rotate-180")} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-primary text-white border-0">
                  {expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 flex flex-col mt-2 overflow-y-auto overflow-x-hidden scrollbar-premium">
              <div className={cn("space-y-1", isSidebarExpanded ? "px-2" : "px-2")}>
                {[...navItems, { href: projectsNav.href, icon: projectsNav.icon, label: projectsNav.label }, { href: helpdeskNavItem.href, icon: helpdeskNavItem.icon, label: helpdeskNavItem.label }].map((item) => {
                  const active = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
                  const Icon = item.icon as any;
                  
                  const linkElement = (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        "group relative flex items-center transition-all duration-200",
                        "hover:scale-[1.02] active:scale-[0.98]",
                        isSidebarExpanded 
                          ? "mx-2 my-1 h-11 rounded-xl gap-3 px-3" 
                          : "mx-auto my-1 h-11 w-11 rounded-xl justify-center",
                        active 
                          ? "bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-white shadow-lg shadow-primary/30" 
                          : "text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-foreground"
                      )}
                    > 
                      {/* Active indicator bar - only show when expanded */}
                      {active && isSidebarExpanded && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm" />
                      )}
                      
                      {/* Icon container */}
                      <span className={cn(
                        "flex items-center justify-center rounded-lg transition-all duration-200 shrink-0",
                        isSidebarExpanded ? "h-9 w-9" : "h-9 w-9",
                        active 
                          ? "bg-white/20 backdrop-blur-sm" 
                          : "bg-transparent group-hover:bg-primary/10"
                      )}>
                        <Icon className={cn(
                          "transition-all duration-200",
                          isSidebarExpanded ? "h-5 w-5" : "h-5 w-5",
                          active ? "text-white" : "text-muted-foreground group-hover:text-primary"
                        )} />
                      </span>
                      
                      {/* Label */}
                      {isSidebarExpanded && (
                        <span className="text-sm font-semibold whitespace-nowrap transition-all duration-300">
                          {item.label}
                        </span>
                      )}
                      
                      {/* Chevron for active items */}
                      {active && isSidebarExpanded && (
                        <ChevronRight className="h-4 w-4 ml-auto text-white/80 animate-in slide-in-from-right-2" />
                      )}
                    </Link>
                  );

                  if (!isSidebarExpanded) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          {linkElement}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-primary text-white border-0">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return linkElement;
                })}
              </div>
            </nav>

            {/* Footer Section */}
            <div className="flex flex-col gap-2 mt-auto border-t border-border/30 pt-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    href={accountNavItem.href} 
                    className={cn(
                      "group relative flex items-center transition-all duration-200",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      isSidebarExpanded 
                        ? "mx-2 h-11 rounded-xl gap-3 px-3" 
                        : "mx-auto h-11 w-11 rounded-xl justify-center",
                      pathname.startsWith(accountNavItem.href) 
                        ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md shadow-primary/20" 
                        : "text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5"
                    )}
                  > 
                    <span className={cn(
                      "flex items-center justify-center rounded-lg transition-all duration-200 shrink-0",
                      isSidebarExpanded ? "h-9 w-9" : "h-9 w-9",
                      pathname.startsWith(accountNavItem.href)
                        ? "bg-white/20 backdrop-blur-sm"
                        : "bg-primary/10 group-hover:bg-primary/20"
                    )}>
                      <accountNavItem.icon className="h-5 w-5" />
                    </span>
                    {isSidebarExpanded && (
                      <span className="text-sm font-semibold whitespace-nowrap transition-all duration-300">
                        {accountNavItem.label}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {!isSidebarExpanded && (
                  <TooltipContent side="right" className="bg-primary text-white border-0">
                    {accountNavItem.label}
                  </TooltipContent>
                )}
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleLogout} 
                    className={cn(
                      "flex items-center transition-all duration-200 text-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50/50 hover:scale-[1.02] active:scale-[0.98] group",
                      isSidebarExpanded 
                        ? "mx-2 h-11 rounded-xl gap-3 px-3" 
                        : "mx-auto h-11 w-11 rounded-xl justify-center"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-all duration-200 shrink-0",
                      isSidebarExpanded ? "h-9 w-9" : "h-9 w-9"
                    )}>
                      <LogOut className="h-5 w-5" />
                    </span>
                    {isSidebarExpanded && (
                      <span className="text-sm font-semibold whitespace-nowrap transition-all duration-300">
                        Logout
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                {!isSidebarExpanded && (
                  <TooltipContent side="right" className="bg-red-500 text-white border-0">
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </aside>

        {/* Main area with left margin equal to rail width */}
        <div className={cn(isSidebarExpanded ? "ml-64" : "ml-16")}> 
            <div className="flex flex-col">
            {/* Header removed - user menu moved to sidebar */}
            <main className="flex-1 p-4 lg:p-6 bg-transparent">
                {children}
            </main>
            </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
