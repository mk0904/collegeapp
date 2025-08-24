
'use client'

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Submission } from '@/lib/mock-data';
import { getSubmissionById } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function SubmissionDetailsPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = React.useState<Submission | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const submissionData = await getSubmissionById(params.id);
        setSubmission(submissionData);
      } catch (error) {
        console.error("Error fetching submission details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (loading) {
    return <SubmissionSkeleton />;
  }

  if (!submission) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Submission not found</h1>
        <Button variant="link" asChild>
           <Link href="/dashboard/projects">Go back to projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-4">
            <Button variant="ghost" asChild className="pl-0">
                <Link href={`/dashboard/projects/${submission.projectId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Project
                </Link>
            </Button>
        </div>

        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-headline mb-1">{submission.title}</CardTitle>
                        <CardDescription>
                            Submitted by <span className="font-semibold">{submission.userName}</span> on {submission.timestamp}
                        </CardDescription>
                    </div>
                    <Badge variant={submission.status === 'Approved' ? 'default' : submission.status === 'Rejected' ? 'destructive' : 'secondary'}>
                        {submission.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">{submission.description}</p>

                {submission.images && submission.images.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Submitted Files</h3>
                        <Carousel className="w-full">
                            <CarouselContent>
                                {submission.images.map((img, index) => (
                                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                     <Card className="overflow-hidden cursor-pointer">
                                                        <CardContent className="p-0 flex aspect-video items-center justify-center">
                                                            <Image src={img.url} alt={`Submission image ${index + 1}`} width={600} height={400} className="object-cover w-full h-full" data-ai-hint="science project"/>
                                                        </CardContent>
                                                    </Card>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl p-0">
                                                     <Image src={img.url} alt={`Submission image ${index + 1}`} width={1200} height={800} className="w-full h-auto rounded-lg" data-ai-hint="science project"/>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                )}
                 {submission.images.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No files were attached to this submission.
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                 {submission.status === 'Pending' && (
                    <>
                        <Button variant="destructive">
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                        <Button>
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Approve
                        </Button>
                    </>
                 )}
                  {submission.status !== 'Pending' && (
                     <p className="text-sm text-muted-foreground">This submission has already been reviewed.</p>
                  )}
            </CardFooter>
        </Card>
    </div>
  );
}

function SubmissionSkeleton() {
    return (
         <div className="max-w-4xl mx-auto">
             <div className="mb-4">
                <Skeleton className="h-8 w-32" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 mb-6">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="w-full h-40" />
                        <Skeleton className="w-full h-40" />
                        <Skeleton className="w-full h-40" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    )
}

    