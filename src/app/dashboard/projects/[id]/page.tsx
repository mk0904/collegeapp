import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
import { mockProjects, mockSubmissions } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = mockProjects.find(p => p.id === params.id);

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
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/dashboard/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>
            Part of <span className="font-semibold">{project.schoolName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={project.status === 'Completed' ? 'default' : 'outline'}>
              {project.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            List of all submissions for this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Approve/Reject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.userName}</TableCell>
                  <TableCell>{submission.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant={submission.status === 'Approved' ? 'default' : submission.status === 'Rejected' ? 'destructive' : 'secondary'}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Label htmlFor={`approval-${submission.id}`} className="sr-only">Approval Toggle</Label>
                        <Switch id={`approval-${submission.id}`} defaultChecked={submission.status === 'Approved'} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
