
'use client';

import {
  MoreHorizontal,
  PlusCircle,
  FolderKanban,
  College2,
  Download,
  Check,
  Search,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { Suspense } from 'react'
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
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
import { getProjects, getColleges, updateProjectStatus } from '@/lib/firebase/firestore'
import type { College, Project } from '@/lib/mock-data'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { AddProjectModal } from '@/components/add-project-modal'
import { AddCollegeModal } from '@/components/add-college-modal'

type ProjectStatus = 'Ongoing' | 'Completed' | 'Pending';

function ProjectsContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [colleges, setColleges] = React.useState<College[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState(searchParams?.get('tab') || 'projects');

  // Modal states
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = React.useState(false);
  const [isAddCollegeModalOpen, setIsAddCollegeModalOpen] = React.useState(false);

  // Filtering state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | 'all'>('all');
  const [collegeFilter, setCollegeFilter] = React.useState('all');

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedProjects, fetchedColleges] = await Promise.all([
        getProjects(),
        getColleges(),
      ]);
      setProjects(fetchedProjects);
      setColleges(fetchedColleges);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to fetch project data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const filteredProjects = React.useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesCollege = collegeFilter === 'all' || project.collegeName === collegeFilter;

      return matchesSearch && matchesStatus && matchesCollege;
    });
  }, [projects, searchTerm, statusFilter, collegeFilter]);

  return (
    <>
      <AddProjectModal 
        isOpen={isAddProjectModalOpen}
        onOpenChange={setIsAddProjectModalOpen}
        onProjectAdded={fetchData}
      />
      <AddCollegeModal 
        isOpen={isAddCollegeModalOpen}
        onOpenChange={setIsAddCollegeModalOpen}
        onCollegeAdded={fetchData}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center mb-4">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="projects" className="px-3 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="colleges" className="px-3 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all flex items-center gap-2">
              <College2 className="h-4 w-4" />
              Colleges
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {activeTab === 'projects' ? (
              <Button size="sm" onClick={() => setIsAddProjectModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsAddCollegeModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add College
              </Button>
            )}
          </div>
        </div>
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              {/* Removed title to avoid duplication with dashboard header */}
              <CardDescription>
                Manage all ongoing and completed projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search projects by name..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex w-full sm:w-auto gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          Status <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem checked={statusFilter === 'all'} onCheckedChange={() => setStatusFilter('all')}>All</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={statusFilter === 'Ongoing'} onCheckedChange={() => setStatusFilter('Ongoing')}>Ongoing</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={statusFilter === 'Completed'} onCheckedChange={() => setStatusFilter('Completed')}>Completed</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={statusFilter === 'Pending'} onCheckedChange={() => setStatusFilter('Pending')}>Pending</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          College <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem checked={collegeFilter === 'all'} onCheckedChange={() => setCollegeFilter('all')}>All Colleges</DropdownMenuCheckboxItem>
                        {colleges.map(college => (
                          <DropdownMenuCheckboxItem key={college.id} checked={collegeFilter === college.name} onCheckedChange={() => setCollegeFilter(college.name)}>
                            {college.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
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
                    filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                            {project.name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{project.collegeName}</TableCell>
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
               {filteredProjects.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  No projects found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="colleges">
          <Card>
            <CardHeader>
              <CardDescription>
                Manage registered colleges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search colleges by name..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>College Name</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead className="hidden md:table-cell">District</TableHead>
                      <TableHead className="hidden md:table-cell">Contact Email</TableHead>
                      <TableHead className="hidden md:table-cell">Phone</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      [...Array(4)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      colleges
                        .filter(college => 
                          college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (college.district && college.district.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((college) => (
                          <TableRow key={college.id}>
                            <TableCell className="font-medium">
                              {college.name}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {college.location}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {college.district || 'N/A'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <a href={`mailto:${college.email}`} className="hover:underline text-blue-600 dark:text-blue-400">
                                {college.email}
                              </a>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {college.phone}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{college.projectsCount}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
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
                                  <DropdownMenuItem>View Projects</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                    
                    {colleges.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No colleges found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {colleges.length > 0 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Showing {colleges.length} college(s)
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
