
'use client';

import {
  Activity,
  BookOpenCheck,
  Ticket,
  Users as UsersIcon,
  CalendarCheck,
  LayoutDashboard,
  TrendingUp,
  FileText,
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
import { getColleges, getUsers, getTickets, getProjects, getAttendanceRecords } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { College, User, Project, Ticket } from '@/lib/mock-data';
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
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [tickets, setTickets] = React.useState<Ticket[]>([]);
    const [attendanceRecords, setAttendanceRecords] = React.useState<any[]>([]);

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [fetchedUsers, fetchedColleges, fetchedTickets, fetchedProjects, attendance] = await Promise.all([
                    getUsers(),
                    getColleges(),
                    getTickets(),
                    getProjects(),
                    getAttendanceRecords(),
                ]);

                setUsers(fetchedUsers);
                setColleges(fetchedColleges);
                setProjects(fetchedProjects);
                setTickets(fetchedTickets);
                setAttendanceRecords(attendance || []);
                
                // Count today's attendance by date field (YYYY-MM-DD)
                const todayIso = new Date().toISOString().slice(0,10)
                const attendanceToday = (attendance || []).filter((r: any) => (r.date || '').startsWith(todayIso)).length

                setStats({
                    totalUsers: fetchedUsers.length,
                    totalColleges: fetchedColleges.length,
                    openTickets: fetchedTickets.filter(t => t.status === 'Open').length,
                    totalProjects: fetchedProjects.length,
                    attendanceToday,
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

    // Attendance trends for last 7 days
    const attendanceTrendData = React.useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().slice(0, 10);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const count = attendanceRecords.filter((r: any) => (r.date || '').startsWith(dateStr)).length;
            return { date: dayName, count, fullDate: dateStr };
        });
        return last7Days;
    }, [attendanceRecords]);

    const attendanceChartConfig = {
      count: {
        label: "Check-ins",
        color: "hsl(var(--chart-2))",
      },
    } satisfies ChartConfig

    // Project status distribution
    const projectStatusData = React.useMemo(() => {
        const statusCounts: Record<string, number> = {};
        projects.forEach(project => {
            const status = project.status || 'In Progress';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({
            name,
            value,
            fill: name === 'Completed' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'
        }));
    }, [projects]);

    const projectStatusChartConfig = {
      completed: {
        label: "Completed",
        color: "hsl(var(--chart-1))",
      },
      inProgress: {
        label: "In Progress",
        color: "hsl(var(--chart-3))",
      },
    } satisfies ChartConfig

    // User registration over time (last 6 months)
    const userGrowthData = React.useMemo(() => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const count = users.filter(user => {
                if (!user.createdOn) return false;
                const createdDate = new Date(user.createdOn);
                return createdDate.getFullYear() === year && createdDate.getMonth() === month;
            }).length;
            
            return { month: monthName, users: count };
        });
        return last6Months;
    }, [users]);

    const userGrowthChartConfig = {
      users: {
        label: "New Users",
        color: "hsl(var(--chart-4))",
      },
    } satisfies ChartConfig

    // Tickets by status
    const ticketStatusData = React.useMemo(() => {
        const statusCounts: Record<string, number> = {};
        tickets.forEach(ticket => {
            const status = ticket.status || 'Open';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({
            name,
            value,
            fill: name === 'Open' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'
        }));
    }, [tickets]);

    const ticketChartConfig = {
      open: {
        label: "Open",
        color: "hsl(var(--chart-2))",
      },
      resolved: {
        label: "Resolved",
        color: "hsl(var(--chart-1))",
      },
    } satisfies ChartConfig

  return (
    <div className="h-full flex flex-col gap-6 fade-in">
        {/* Stats - separate tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/users" className="group">
            <Card className="card-premium rounded-2xl border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2 px-6 pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Users</CardTitle>
                    {loading ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <div className="text-3xl font-bold leading-tight tabular-nums bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mt-1">
                        {stats.totalUsers}
                      </div>
                    )}
                  </div>
                  <span className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <UsersIcon className="h-5 w-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Active users
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/helpdesk" className="group">
            <Card className="card-premium rounded-2xl border-0 bg-gradient-to-br from-white to-orange-50/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2 px-6 pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Open Tickets</CardTitle>
                    {loading ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <div className="text-3xl font-bold leading-tight tabular-nums bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mt-1">
                        {stats.openTickets}
                      </div>
                    )}
                  </div>
                  <span className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-3 rounded-2xl text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Ticket className="h-5 w-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                  Requires attention
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/projects" className="group">
            <Card className="card-premium rounded-2xl border-0 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2 px-6 pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Projects</CardTitle>
                    {loading ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <div className="text-3xl font-bold leading-tight tabular-nums bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mt-1">
                        {stats.totalProjects}
                      </div>
                    )}
                  </div>
                  <span className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-3 rounded-2xl text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-5 w-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
                  Active projects
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/attendance" className="group" title="Attendance marked today">
            <Card className="card-premium rounded-2xl border-0 bg-gradient-to-br from-white to-emerald-50/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2 px-6 pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Attendance Today</CardTitle>
                    {loading ? (
                      <Skeleton className="h-8 w-20 mt-2" />
                    ) : (
                      <div className="text-3xl font-bold leading-tight tabular-nums bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mt-1">
                        {stats.attendanceToday}
                      </div>
                    )}
                  </div>
                  <span className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Check-ins today
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Analytics Charts - 4 charts in a single row */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Chart 1: Attendance Trends (Last 7 Days) */}
            <Card className="card-premium flex flex-col rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-bold">Attendance Trends</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">Last 7 days check-ins</CardDescription>
                </CardHeader>
                <CardContent className="pl-2 pr-6 pb-6 flex-1 flex items-center">
                   {loading ? (
                    <div className="flex w-full h-full justify-center items-center">
                        <Skeleton className="w-full h-32" />
                    </div>
                   ) : (
                    <ChartContainer config={attendanceChartConfig} className="w-full h-full min-h-[180px]">
                       <LineChart data={attendanceTrendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                         <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={5}
                            axisLine={false}
                            fontSize={10}
                            />
                         <YAxis fontSize={10} />
                         <ChartTooltip content={<ChartTooltipContent />} />
                         <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="var(--color-count)" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                         />
                       </LineChart>
                    </ChartContainer>
                   )}
                </CardContent>
            </Card>

            {/* Chart 2: Project Status Distribution */}
            <Card className="card-premium flex flex-col rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-bold">Project Status</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">Distribution by status</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center flex-1 pb-6">
                    {loading ? (
                         <div className="flex w-full h-full justify-center items-center">
                            <Skeleton className="w-full h-32" />
                        </div>
                    ) : (
                        <ChartContainer config={projectStatusChartConfig} className="w-full h-full min-h-[180px]">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie
                                    data={projectStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={50}
                                    labelLine={false}
                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                     {projectStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Legend 
                                    wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} 
                                    iconType="circle"
                                />
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Chart 3: User Growth Over Time */}
            <Card className="card-premium flex flex-col rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex items-center gap-2 mb-1">
                        <UsersIcon className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-bold">User Growth</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">New registrations (6 months)</CardDescription>
                </CardHeader>
                <CardContent className="pl-2 pr-6 pb-6 flex-1 flex items-center">
                    {loading ? (
                         <div className="flex w-full h-full justify-center items-center">
                            <Skeleton className="w-full h-32" />
                        </div>
                    ) : (
                        <ChartContainer config={userGrowthChartConfig} className="w-full h-full min-h-[180px]">
                            <AreaChart data={userGrowthData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={5}
                                    axisLine={false}
                                    fontSize={10}
                                />
                                <YAxis fontSize={10} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="users" 
                                    stroke="var(--color-users)" 
                                    fill="var(--color-users)"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Chart 4: Tickets by Status */}
            <Card className="card-premium flex flex-col rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Ticket className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-bold">Tickets Status</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">Open vs Resolved</CardDescription>
                </CardHeader>
                <CardContent className="pl-2 pr-6 pb-6 flex-1 flex items-center">
                    {loading ? (
                         <div className="flex w-full h-full justify-center items-center">
                            <Skeleton className="w-full h-32" />
                        </div>
                    ) : (
                        <ChartContainer config={ticketChartConfig} className="w-full h-full min-h-[180px]">
                            <BarChart data={ticketStatusData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    tickMargin={5}
                                    axisLine={false}
                                    fontSize={10}
                                />
                                <YAxis fontSize={10} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar 
                                    dataKey="value" 
                                    radius={[4, 4, 0, 0]}
                                >
                                    {ticketStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
  );
}
