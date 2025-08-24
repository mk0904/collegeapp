
'use client';

import {
  Activity,
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
import { getSchools, getUsers, getTickets, getProjects } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import type { School, User } from '@/lib/mock-data';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function DashboardPage() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        totalSchools: 0,
        openTickets: 0,
        totalProjects: 0,
    });
    const [loading, setLoading] = React.useState(true);
    const [schools, setSchools] = React.useState<School[]>([]);
    const [users, setUsers] = React.useState<User[]>([]);

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [fetchedUsers, fetchedSchools, tickets, projects] = await Promise.all([
                    getUsers(),
                    getSchools(),
                    getTickets(),
                    getProjects(),
                ]);

                setUsers(fetchedUsers);
                setSchools(fetchedSchools);
                setStats({
                    totalUsers: fetchedUsers.length,
                    totalSchools: fetchedSchools.length,
                    openTickets: tickets.filter(t => t.status === 'Open').length,
                    totalProjects: projects.length,
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const userRoleData = React.useMemo(() => {
        const roles: Record<string, number> = { Admin: 0, Teacher: 0, Student: 0 };
        users.forEach(user => {
            if (user.role in roles) {
                roles[user.role]++;
            }
        });
        return Object.entries(roles).map(([name, value]) => ({ name, value, fill: `var(--color-${name.toLowerCase()})` }));
    }, [users]);
    
    const userChartConfig = {
      admin: {
        label: "Admin",
        color: "hsl(var(--chart-1))",
      },
      teacher: {
        label: "Teacher",
        color: "hsl(var(--chart-2))",
      },
      student: {
        label: "Student",
        color: "hsl(var(--chart-3))",
      },
    } satisfies ChartConfig

    const projectChartConfig = {
      projects: {
        label: "Projects",
        color: "hsl(var(--chart-1))",
      },
    } satisfies ChartConfig

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
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
                {loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-xs text-muted-foreground">Track and manage all users</p>}
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/projects?tab=schools">
            <Card className="hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {loading ? <Skeleton className="h-7 w-10" /> : <div className="text-2xl font-bold">{stats.totalSchools}</div>}
                 {loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-xs text-muted-foreground">Total registered schools</p>}
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
                 {loading ? <Skeleton className="h-4 w-28 mt-1" /> : <p className="text-xs text-muted-foreground">Resolve outstanding queries</p>}
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/projects">
            <Card className="hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-7 w-14" /> : <div className="text-2xl font-bold">{stats.totalProjects}</div>}
                {loading ? <Skeleton className="h-4 w-28 mt-1" /> : <p className="text-xs text-muted-foreground">Across all schools</p>}
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid gap-4 mt-8 grid-cols-1 lg:grid-cols-2">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Projects by School</CardTitle>
                     <CardDescription>A look at the distribution of projects across schools.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                   {loading ? (
                    <div className="flex aspect-video justify-center items-center">
                        <Skeleton className="w-full h-[300px]" />
                    </div>
                   ) : (
                    <ChartContainer config={projectChartConfig} className="min-h-[300px] w-full">
                       <BarChart accessibilityLayer data={schools} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                         <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            />
                         <YAxis />
                         <ChartTooltip content={<ChartTooltipContent />} />
                         <Bar dataKey="projectsCount" fill="var(--color-projects)" radius={4} />
                       </BarChart>
                    </ChartContainer>
                   )}
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>User Role Distribution</CardTitle>
                    <CardDescription>A breakdown of users by their assigned role.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center [&>div]:h-[300px]">
                    {loading ? (
                         <div className="flex aspect-video justify-center items-center">
                            <Skeleton className="w-full h-[300px]" />
                        </div>
                    ) : (
                        <ChartContainer config={userChartConfig} className="min-h-[300px] w-full">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie
                                    data={userRoleData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    labelLine={false}
                                     label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                     {userRoleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Legend contentStyle={{ textTransform: 'capitalize' }} />
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
      </>
  );
}
