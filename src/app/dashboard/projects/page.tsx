
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
import { useRouter } from 'next/navigation'
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
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { getProjects, getColleges, updateProjectStatus } from '@/lib/firebase/firestore'
import type { College, Project } from '@/lib/mock-data'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { AddProjectModal } from '@/components/add-project-modal'
import { AddCollegeModal } from '@/components/add-college-modal'

type ProjectStatus = 'Ongoing' | 'Completed' | 'Pending';

function ProjectsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [colleges, setColleges] = React.useState<College[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab] = React.useState('projects');

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
      <Tabs value={activeTab}>
        <div className="flex items-center mb-4">
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
              <Button size="sm" onClick={() => setIsAddProjectModalOpen(true)} className="btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
          </div>
        </div>
        <TabsContent value="projects">
          <Card className="card-premium rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold mb-1">Project Management</h2>
              <CardDescription className="text-sm">
                Manage all ongoing and completed projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search projects by name..."
                      className="pl-10 w-full h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex w-full sm:w-auto gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200">
                          Status <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-lg">
                        <DropdownMenuCheckboxItem checked={statusFilter === 'all'} onCheckedChange={() => setStatusFilter('all')}>All</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={statusFilter === 'Ongoing'} onCheckedChange={() => setStatusFilter('Ongoing')}>Ongoing</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={statusFilter === 'Completed'} onCheckedChange={() => setStatusFilter('Completed')}>Completed</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={statusFilter === 'Pending'} onCheckedChange={() => setStatusFilter('Pending')}>Pending</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200">
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
              <div className="rounded-xl border border-border/50 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg">
              <Table className="text-sm">
                <TableHeader>
                <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead className="hidden md:table-cell">College</TableHead>
                    <TableHead className="hidden md:table-cell">Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Complete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i} className="h-12 min-h-12 [&>td]:py-2">
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow 
                        key={project.id} 
                        className="h-12 min-h-12 [&>td]:py-2 cursor-pointer"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        <TableCell className="font-medium">
                          {project.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{project.collegeName}</TableCell>
                        <TableCell className="hidden md:table-cell">{project.submissionsCount}</TableCell>
                        <TableCell>
                          <Badge variant={project.status === 'Completed' ? 'default' : 'outline'} className="shadow-sm">
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {project.status === 'Ongoing' ? (
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="bg-primary/10 hover:bg-primary/20"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleCompleteProject(project.id); 
                              }}
                              title="Mark as Completed"
                            >
                              <Check className="h-4 w-4 text-primary" />
                              <span className="sr-only">Mark as Completed</span>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
               {filteredProjects.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  No projects found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Colleges tab removed; now accessible from its own sidebar page */}
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
