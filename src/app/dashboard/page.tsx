
'use client';

import {
  Activity,
  BookOpenCheck,
  Ticket,
  Users as UsersIcon,
  CalendarCheck,
  LayoutDashboard,
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
import { getColleges, getUsers, getTickets, getProjects } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import type { College, User } from '@/lib/mock-data';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function DashboardPage() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        totalColleges: 0,
        openTickets: 0,
        totalProjects: 0,
        attendanceToday: 0,
    });
    const [loading, setLoading] = React.useState(true);
    const [colleges, setColleges] = React.useState<College[]>([]);
    const [users, setUsers] = React.useState<User[]>([]);

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [fetchedUsers, fetchedColleges, tickets, projects] = await Promise.all([
                    getUsers(),
                    getColleges(),
                    getTickets(),
                    getProjects(),
                ]);

                setUsers(fetchedUsers);
                setColleges(fetchedColleges);
                setStats({
                    totalUsers: fetchedUsers.length,
                    totalColleges: fetchedColleges.length,
                    openTickets: tickets.filter(t => t.status === 'Open').length,
                    totalProjects: projects.length,
                    attendanceToday: 0,
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
    <div className="h-full flex flex-col gap-4">
        {/* Stats - separate tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/dashboard/users">
            <Card className="rounded-xl border border-neutral-200/80 bg-white/90 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-primary/20">
              <CardHeader className="pb-1 px-4 pt-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <span className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl text-white">
                    <UsersIcon className="h-5 w-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-5 w-10" /> : <div className="text-2xl font-semibold leading-tight tabular-nums">{stats.totalUsers}</div>}
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/helpdesk">
            <Card className="rounded-xl border border-neutral-200/80 bg-white/90 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-primary/20">
              <CardHeader className="pb-1 px-4 pt-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                  <span className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl text-white">
                    <Ticket className="h-5 w-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-5 w-10" /> : <div className="text-2xl font-semibold leading-tight tabular-nums">{stats.openTickets}</div>}
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/projects">
            <Card className="rounded-xl border border-neutral-200/80 bg-white/90 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-primary/20">
              <CardHeader className="pb-1 px-4 pt-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <span className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-xl text-white">
                    <Activity className="h-5 w-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-5 w-10" /> : <div className="text-2xl font-semibold leading-tight tabular-nums">{stats.totalProjects}</div>}
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard" title="Attendance marked today">
            <Card className="rounded-xl border border-neutral-200/80 bg-white/90 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-primary/20">
              <CardHeader className="pb-1 px-4 pt-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
                  <span className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-xl text-white">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-5 w-10" /> : <div className="text-2xl font-semibold leading-tight tabular-nums">{stats.attendanceToday}</div>}
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Charts - Side by side layout with reduced heights */}
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 flex-1">
            <Card className="flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Projects by College</CardTitle>
                     <CardDescription className="text-xs">Distribution of projects across colleges.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2 flex-1 flex items-center">
                   {loading ? (
                    <div className="flex w-full h-full justify-center items-center">
                        <Skeleton className="w-full h-full" />
                    </div>
                   ) : (
                    <ChartContainer config={projectChartConfig} className="w-full h-full">
                       <BarChart accessibilityLayer data={colleges} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                         <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={5}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            fontSize={10}
                            />
                         <YAxis fontSize={10} />
                         <ChartTooltip content={<ChartTooltipContent />} />
                         <Bar dataKey="projectsCount" fill="var(--color-projects)" radius={2} />
                       </BarChart>
                    </ChartContainer>
                   )}
                </CardContent>
            </Card>
             <Card className="flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">User Role Distribution</CardTitle>
                    <CardDescription className="text-xs">Breakdown of users by their assigned role.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center flex-1">
                    {loading ? (
                         <div className="flex w-full h-full justify-center items-center">
                            <Skeleton className="w-full h-full" />
                        </div>
                    ) : (
                        <ChartContainer config={userChartConfig} className="w-full h-full">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie
                                    data={userRoleData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={60}
                                    labelLine={false}
                                     label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                     {userRoleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Legend wrapperStyle={{ textTransform: 'capitalize', fontSize: '10px' }} />
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
  );
}
