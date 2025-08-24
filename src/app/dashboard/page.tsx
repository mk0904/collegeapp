
'use client';

import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  Ticket,
  Users as UsersIcon,
} from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import * as React from 'react';
import { getProjects, getSchools, getUsers, getTickets, getSubmissions } from '@/lib/firebase/firestore';
import type { Project } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        totalSchools: 0,
        openTickets: 0,
        pendingSubmissions: 0,
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [users, schools, tickets, submissions] = await Promise.all([
                    getUsers(),
                    getSchools(),
                    getTickets(),
                    getSubmissions(),
                ]);

                setStats({
                    totalUsers: users.length,
                    totalSchools: schools.length,
                    openTickets: tickets.filter(t => t.status === 'Open').length,
                    pendingSubmissions: submissions.filter(s => s.status === 'Pending').length,
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);


  return (
    <div className="flex w-full flex-col">
      <main className="flex flex-1 flex-col gap-6 md:gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
                <p className="text-muted-foreground">An overview of your college ecosystem.</p>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Link href="/dashboard/users">
            <Card className="hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold">{stats.totalUsers}</div>}
                {loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-xs text-muted-foreground">+20.1% from last month</p>}
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/projects">
            <Card className="hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
              </Header>
              <CardContent>
                 {loading ? <Skeleton className="h-7 w-10" /> : <div className="text-2xl font-bold">{stats.totalSchools}</div>}
                 {loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-xs text-muted-foreground">+1 since last quarter</p>}
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/helpdesk">
            <Card className="hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Support Tickets</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{stats.openTickets}</div>}
                 {loading ? <Skeleton className="h-4 w-28 mt-1" /> : <p className="text-xs text-muted-foreground">+2 since yesterday</p>}
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/projects">
            <Card className="hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-7 w-14" /> : <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>}
                {loading ? <Skeleton className="h-4 w-28 mt-1" /> : <p className="text-xs text-muted-foreground">+2 since last hour</p>}
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
