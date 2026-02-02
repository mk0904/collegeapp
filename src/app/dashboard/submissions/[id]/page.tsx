
'use client'

import * as React from 'react';
import Link from 'next/link';
// Using regular img tag for Firebase Storage URLs
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Submission } from '@/lib/mock-data';
import { getSubmissionById } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SubmissionDetailsPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = React.useState<(Submission & { notes?: string; percentage?: number; projectName?: string; userId?: string; createdAt?: string }) | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number | null>(null);

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
    <div className="max-w-5xl mx-auto fade-in">
        <div className="mb-4">
            <Button variant="ghost" asChild className="pl-0">
                <Link href={`/dashboard/projects/${submission.projectId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Project
                </Link>
            </Button>
        </div>

        {/* Main Submission Card */}
        <Card className="card-premium rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 mb-6">
            <CardHeader className="px-8 pt-8 pb-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-3xl font-bold mb-2">{submission.title || submission.projectName || 'Submission'}</CardTitle>
                        <CardDescription className="text-base mt-2">
                            <div className="space-y-1">
                                <div>Submitted by <span className="font-semibold text-foreground">{submission.userName}</span></div>
                                <div className="text-sm text-muted-foreground">on {submission.timestamp}</div>
                                {submission.projectName && (
                                    <div className="text-sm text-muted-foreground">Project: <span className="font-medium text-foreground">{submission.projectName}</span></div>
                                )}
                            </div>
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant={submission.status === 'Approved' ? 'default' : submission.status === 'Rejected' ? 'destructive' : 'secondary'} className="shadow-sm text-sm px-3 py-1">
                            {submission.status}
                        </Badge>
                        {submission.percentage != null && (
                            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                {submission.percentage}%
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                {/* Description/Notes */}
                {(submission.description || submission.notes) && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Description / Notes</h3>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {submission.description || submission.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Images Gallery */}
                {submission.images && submission.images.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Submitted Files ({submission.images.length})</h3>
                        <Carousel className="w-full">
                            <CarouselContent>
                                {submission.images.map((img, index) => (
                                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <Dialog open={selectedImageIndex === index} onOpenChange={(open) => setSelectedImageIndex(open ? index : null)}>
                                                <DialogTrigger asChild>
                                                    <Card className="overflow-hidden cursor-pointer card-premium rounded-xl hover:shadow-lg transition-all duration-200">
                                                        <CardContent className="p-0 flex aspect-video items-center justify-center bg-muted/20 overflow-hidden">
                                                            {(() => {
                                                                const imageUrl = typeof img === 'object' && img.url ? img.url : (typeof img === 'string' ? img : '');
                                                                return imageUrl ? (
                                                                    <img 
                                                                        src={imageUrl} 
                                                                        alt={`Submission image ${index + 1}`} 
                                                                        className="object-cover w-full h-full"
                                                                        loading="lazy"
                                                                        onError={(e) => {
                                                                            console.error('Image failed to load:', imageUrl);
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.style.display = 'none';
                                                                            const errorDiv = document.createElement('div');
                                                                            errorDiv.className = 'text-center p-4 text-muted-foreground text-sm';
                                                                            errorDiv.textContent = 'Image unavailable';
                                                                            target.parentElement?.appendChild(errorDiv);
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="text-center p-4 text-muted-foreground text-sm">No image</div>
                                                                );
                                                            })()}
                                                        </CardContent>
                                                    </Card>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-5xl p-0 rounded-2xl border-0 shadow-2xl">
                                                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                                                        <DialogTitle className="text-xl font-bold">
                                                            {typeof img === 'object' && img.name ? img.name : `Submission Image ${index + 1}`}
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="px-6 pb-6">
                                                        <div className="relative w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
                                                            {(() => {
                                                                const imageUrl = typeof img === 'object' && img.url ? img.url : (typeof img === 'string' ? img : '');
                                                                return imageUrl ? (
                                                                    <img 
                                                                        src={imageUrl} 
                                                                        alt={`Submission image ${index + 1}`} 
                                                                        className="w-full h-auto max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg"
                                                                        onError={(e) => {
                                                                            console.error('Image failed to load in modal:', imageUrl);
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.style.display = 'none';
                                                                            const errorDiv = document.createElement('div');
                                                                            errorDiv.className = 'text-center p-12 text-muted-foreground';
                                                                            errorDiv.innerHTML = '<p class="text-lg font-medium mb-2">Failed to load image</p><p class="text-sm">The image URL may be invalid or expired.</p>';
                                                                            target.parentElement?.appendChild(errorDiv);
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="text-center p-12 text-muted-foreground">
                                                                        <p className="text-lg font-medium mb-2">No image available</p>
                                                                        <p className="text-sm">Image URL is missing</p>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="rounded-xl" />
                            <CarouselNext className="rounded-xl" />
                        </Carousel>
                    </div>
                )}
                {(!submission.images || submission.images.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                        <p className="text-sm">No files were attached to this submission.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-0 flex justify-end gap-3 border-t border-border/50">
                 {submission.status === 'Pending' && (
                    <>
                        <Button variant="destructive" className="rounded-xl h-10">
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                        <Button className="btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300 rounded-xl h-10">
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

    