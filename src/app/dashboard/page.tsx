
'use client';

import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  Ticket,
  Users as UsersIcon,
} from 'lucide-react';
import Link from 'next/link';

import ActionableInsights from '@/components/actionable-insights';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import * as React from 'react';
import { getProjects, getSchools, getUsers, getTickets, getSubmissions } from '@/lib/firebase/firestore';
import type { Project } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

const chartData = [
  { month: 'January', users: 186 },
  { month: 'February', users: 305 },
  { month: 'March', users: 237 },
  { month: 'April', users: 273 },
  { month: 'May', users: 209 },
  { month: 'June', users: 214 },
];

const chartConfig = {
  users: {
    label: 'Users',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        totalSchools: 0,
        openTickets: 0,
        pendingSubmissions: 0,
    });
    const [recentProjects, setRecentProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [users, schools, tickets, projects, submissions] = await Promise.all([
                    getUsers(),
                    getSchools(),
                    getTickets(),
                    getProjects({ limit: 4 }),
                    getSubmissions(),
                ]);

                setStats({
                    totalUsers: users.length,
                    totalSchools: schools.length,
                    openTickets: tickets.filter(t => t.status === 'Open').length,
                    pendingSubmissions: submissions.filter(s => s.status === 'Pending').length,
                });

                setRecentProjects(projects);

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
            <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Total Users</CardTitle>
                <UsersIcon className="h-4 w-4 text-primary/80" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>}
                {loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-xs text-primary/80">+20.1% from last month</p>}
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/projects">
            <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Total Schools</CardTitle>
                <BookOpenCheck className="h-4 w-4 text-primary/80" />
              </CardHeader>
              <CardContent>
                 {loading ? <Skeleton className="h-7 w-10" /> : <div className="text-2xl font-bold text-primary">{stats.totalSchools}</div>}
                 {loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-xs text-primary/80">+1 since last quarter</p>}
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/helpdesk">
            <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Open Support Tickets</CardTitle>
                <Ticket className="h-4 w-4 text-primary/80" />
              </CardHeader>
              <CardContent>
                 {loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold text-primary">{stats.openTickets}</div>}
                 {loading ? <Skeleton className="h-4 w-28 mt-1" /> : <p className="text-xs text-primary/80">+2 since yesterday</p>}
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/projects">
            <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Pending Submissions</CardTitle>
                <Activity className="h-4 w-4 text-primary/80" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-7 w-14" /> : <div className="text-2xl font-bold text-primary">{stats.pendingSubmissions}</div>}
                {loading ? <Skeleton className="h-4 w-28 mt-1" /> : <p className="text-xs text-primary/80">+2 since last hour</p>}
              </CardContent>
            </Card>
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-headline mb-4">AI-Driven Actionable Insights</h2>
          <ActionableInsights />
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly new users over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full p-2">
              <ResponsiveContainer width="100%" height="100%">
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--accent))' }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Recently added or updated projects.</CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/projects">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {loading ? (
                    [...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-36 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-20" /></TableCell>
                      </TableRow>
                    ))
                   ) : (
                    recentProjects.map(project => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="font-medium">{project.name}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {project.schoolName}
                          </div>
                        </TableCell>
                        <TableCell className="text-right"><Badge variant={project.status === 'Completed' ? 'default' : project.status === 'Pending' ? 'secondary' : 'outline'}>{project.status}</Badge></TableCell>
                      </TableRow>
                    ))
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
