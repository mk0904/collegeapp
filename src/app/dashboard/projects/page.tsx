'use client';

import {
  MoreHorizontal,
  PlusCircle,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { getProjects, getSchools } from '@/lib/firebase/firestore'
import type { School, Project } from '@/lib/mock-data'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [schools, setSchools] = React.useState<School[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('projects');

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [fetchedProjects, fetchedSchools] = await Promise.all([
          getProjects(),
          getSchools(),
        ]);
        setProjects(fetchedProjects);
        setSchools(fetchedSchools);
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center">
        <TabsList className="gap-2">
          <TabsTrigger value="projects" className="rounded-md">Projects</TabsTrigger>
          <TabsTrigger value="schools" className="rounded-md">Schools</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline">
            Export
          </Button>
           {activeTab === 'projects' ? (
            <Button size="sm" asChild>
              <Link href="/dashboard/projects/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Link>
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href="/dashboard/schools/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add School
              </Link>
            </Button>
          )}
        </div>
      </div>
      <TabsContent value="projects">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Manage all ongoing and completed projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead className="hidden md:table-cell">School</TableHead>
                  <TableHead className="hidden md:table-cell">Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{project.schoolName}</TableCell>
                      <TableCell className="hidden md:table-cell">{project.submissionsCount}</TableCell>
                      <TableCell>
                        <Badge variant={project.status === 'Completed' ? 'default' : 'outline'}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="schools">
        <Card>
          <CardHeader>
            <CardTitle>Schools</CardTitle>
            <CardDescription>
              Manage registered schools.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {loading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                     <CardFooter>
                      <Skeleton className="h-4 w-20" />
                    </CardFooter>
                  </Card>
                ))
             ) : (
              schools.map((school) => (
                <Card key={school.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{school.location}</p>
                  </CardContent>
                  <CardFooter>
                    <p>{school.projectsCount} projects</p>
                  </CardFooter>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
