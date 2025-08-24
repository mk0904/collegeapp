
'use client';

import {
  MoreHorizontal,
  PlusCircle,
  FolderKanban,
  School as SchoolIcon,
  Download,
  Check,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useSearchParams } from 'next/navigation'

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
import { getProjects, getSchools, updateProjectStatus } from '@/lib/firebase/firestore'
import type { School, Project } from '@/lib/mock-data'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [schools, setSchools] = React.useState<School[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState(searchParams.get('tab') || 'projects');

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

  const handleCompleteProject = async (projectId: string) => {
    try {
      await updateProjectStatus(projectId, 'Completed');
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'Completed' } : p));
      toast({ title: "Success", description: "Project has been marked as completed."});
    } catch (error) {
        console.error("Error completing project:", error);
        toast({ title: "Error", description: "Failed to update the project status.", variant: "destructive" });
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center mb-4">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="projects" className="px-3 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="schools" className="px-3 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all flex items-center gap-2">
            <SchoolIcon className="h-4 w-4" />
            Colleges
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
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
              <Link href="/dashboard/colleges/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add College
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
                  <TableHead className="hidden md:table-cell">College</TableHead>
                  <TableHead className="hidden md:table-cell">Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            {project.status === 'Ongoing' && (
                                <Button 
                                    size="icon" 
                                    variant="ghost"
                                    className="bg-primary/10 hover:bg-primary/20"
                                    onClick={(e) => { e.stopPropagation(); handleCompleteProject(project.id); }}
                                    title="Mark as Completed"
                                >
                                    <Check className="h-4 w-4 text-primary" />
                                    <span className="sr-only">Mark as Completed</span>
                                </Button>
                            )}
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
                        </div>
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
            <CardTitle>Colleges</CardTitle>
            <CardDescription>
              Manage registered colleges.
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
