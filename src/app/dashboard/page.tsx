'use client'

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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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
  return (
    <div className="flex w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,500</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Schools
              </CardTitle>
              <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">+1 since last quarter</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Support Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 since yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">+2 since last hour</p>
            </CardContent>
          </Card>
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
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis />
                        <ChartTooltip
                            cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="users" fill="var(--color-users)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Recently added or updated projects.
                </CardDescription>
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
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Digital Literacy Campaign</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        Kohima Science College
                      </div>
                    </TableCell>
                    <TableCell className="text-right"><Badge variant="outline">Ongoing</Badge></TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell>
                      <div className="font-medium">Community Health Survey</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        Model Christian College
                      </div>
                    </TableCell>
                    <TableCell className="text-right"><Badge variant="outline">Ongoing</Badge></TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell>
                      <div className="font-medium">Eco-Friendly Campus</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        Kohima Science College
                      </div>
                    </TableCell>
                    <TableCell className="text-right"><Badge>Completed</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
