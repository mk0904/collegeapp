
'use client'

import { ArrowLeft, View } from "lucide-react";
import Link from "next/link";
import * as React from 'react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProjectById, getSubmissionsByProjectId } from "@/lib/firebase/firestore";
import type { Project, Submission } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [project, setProject] = React.useState<Project | null>(null);
  const [submissions, setSubmissions] = React.useState<(Submission & { percentage?: number })[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const projectData = await getProjectById(id);
        setProject(projectData);
        if (projectData) {
          const submissionsData = await getSubmissionsByProjectId(id);
          setSubmissions(submissionsData);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
     return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
             </div>
             <div className="mt-4">
                <Skeleton className="h-6 w-24" />
             </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-5 w-64" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-9 w-20" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Link href="/dashboard/projects" className="text-primary hover:underline">
          Go back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 fade-in">
      <div>
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/dashboard/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
      <Card className="card-premium rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                Part of <span className="font-semibold">{project.collegeName}</span>
              </CardDescription>
            </div>
             <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={project.status === 'Completed' ? 'default' : 'outline'} className="shadow-sm">
                {project.status}
                </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <p className="text-muted-foreground leading-relaxed">{project.description}</p>
        </CardContent>
      </Card>
      
      <Card className="card-premium rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-xl font-bold">Submissions</CardTitle>
          <CardDescription className="text-sm">
            List of all submissions for this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {submissions.length > 0 ? (
            <div className="rounded-xl border border-border/50 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow 
                    key={submission.id}
                    className="cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/submissions/${submission.id}`}
                  >
                    <TableCell className="font-medium">{submission.userName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{submission.timestamp}</TableCell>
                    <TableCell>
                      {(submission as any).percentage != null ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{(submission as any).percentage}%</span>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                              style={{ width: `${Math.min((submission as any).percentage || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={submission.status === 'Approved' ? 'default' : submission.status === 'Rejected' ? 'destructive' : 'secondary'} className="shadow-sm">
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button asChild variant="outline" size="sm" className="rounded-xl">
                        <Link href={`/dashboard/submissions/${submission.id}`}>
                          <View className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No submissions for this project yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
