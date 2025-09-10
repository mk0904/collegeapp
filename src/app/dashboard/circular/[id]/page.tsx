'use client'

import * as React from 'react'
import {
  FileText,
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  Download,
  Mail,
  ExternalLink,
  File,
  Image
} from 'lucide-react'

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
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { getCircularById } from '@/lib/firebase/circular'

// Types
type CircularFile = {
  id: string;
  url: string;
  name: string;
  type: string;
}

type Circular = {
  id: string;
  title: string;
  message: string;
  sentDate: string;
  sentTime: string;
  status: 'Sent' | 'Draft';
  files: CircularFile[];
  recipientCount: number;
  district: string;
  school: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Mock data
const mockCircular: Circular = {
  id: 'circ-001',
  title: 'End of Year Exam Schedule',
  message: `Dear faculty and students,

This circular is to inform you about the end of year examination schedule for the academic year 2025. The examinations will commence on December 5th, 2025 and conclude on December 20th, 2025.

All students are required to:
1. Clear all fee dues before November 15th
2. Collect their hall tickets from the respective department offices
3. Adhere to the examination code of conduct

The detailed timetable for each course is attached to this circular. Please review it carefully and plan accordingly.

For any queries, please contact the examination department at exams@college.edu.`,
  sentDate: '2025-08-20',
  sentTime: '10:30 AM',
  status: 'Sent',
  files: [
    {
      id: 'file-001',
      name: 'exam_schedule.pdf',
      url: 'https://example.com/files/exam_schedule.pdf',
      type: 'application/pdf'
    },
    {
      id: 'file-002',
      name: 'code_of_conduct.docx',
      url: 'https://example.com/files/code_of_conduct.docx',
      type: 'application/msword'
    },
    {
      id: 'file-003',
      name: 'campus_map.jpg',
      url: 'https://example.com/files/campus_map.jpg',
      type: 'image/jpeg'
    }
  ],
  recipientCount: 145,
  district: 'North District',
  school: 'All Colleges',
  createdBy: {
    id: 'user-001',
    name: 'Principal Johnson',
    avatar: ''
  }
};

export default function CircularDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [circular, setCircular] = React.useState<Circular | null>(null)
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => {
    const fetchCircular = async () => {
      setLoading(true)
      try {
        // Fetch from Firebase
        const fetchedCircular = await getCircularById(params.id);
        
        if (!fetchedCircular) {
          throw new Error('Circular not found');
        }
        
        // Format the data for display
        const data = fetchedCircular as any;
        
        // Format date and time if available
        let sentDate = 'Not sent';
        let sentTime = '';
        if (data.sentDate) {
          // Convert Firestore timestamp to Date
          const date = data.sentDate.toDate ? data.sentDate.toDate() : new Date(data.sentDate);
          sentDate = date.toLocaleDateString();
          sentTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // Format the circular data
        const formattedCircular: Circular = {
          id: data.id,
          title: data.title || 'Untitled',
          message: data.message || '',
          sentDate: sentDate,
          sentTime: sentTime,
          status: data.status || 'Draft',
          files: data.files || [],
          recipientCount: data.recipientCount || 0,
          district: data.district || 'All Districts',
          school: data.school || 'All Colleges',
          createdBy: {
            id: data.createdBy || 'unknown',
            name: data.createdByName || 'Unknown User',
            avatar: data.createdByAvatar || '',
          }
        };
        
        console.log('Fetched circular:', formattedCircular);
        setCircular(formattedCircular);
      } catch (error) {
        console.error('Error fetching circular:', error);
        toast({
          title: 'Error',
          description: 'Failed to load circular details.',
          variant: 'destructive'
        });
        
        // Fallback to mock data in development
        if (process.env.NODE_ENV === 'development') {
          setCircular(mockCircular);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCircular();
  }, [params.id, toast]);
  
  const handleDownload = (file: CircularFile) => {
    // In a real app, this would trigger a file download
    toast({
      title: 'Download Started',
      description: `Downloading ${file.name}...`
    })
    
    // Simulating download by opening in new tab
    window.open(file.url, '_blank')
  }
  
  const handleDownloadAll = () => {
    if (!circular) return
    
    toast({
      title: 'Download Started',
      description: `Downloading all ${circular.files.length} files...`
    })
    
    // In a real app, this would create a zip of all files
    // For now, just open the first file as an example
    if (circular.files.length > 0) {
      window.open(circular.files[0].url, '_blank')
    }
  }
  
  // Function to get the appropriate icon for a file based on its type
  const getFileIcon = (type: string) => {
    if (type.includes('image')) {
      return <Image className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard/circular">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Circulars
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-72 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!circular) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard/circular">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Circulars
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Circular Not Found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                The circular you're looking for doesn't exist or you may not have access to it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/circular">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Circulars
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{circular.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={circular.status === 'Sent' ? 'default' : 'secondary'}>
                  {circular.status}
                </Badge>
                <span className="inline-flex items-center text-sm text-muted-foreground">
                  <Users className="mr-1 h-3.5 w-3.5" />
                  {circular.recipientCount} recipients
                </span>
                <span className="inline-flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {circular.sentDate}
                </span>
                <span className="inline-flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {circular.sentTime}
                </span>
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Forward
              </Button>
              {circular.files.length > 0 && (
                <Button onClick={handleDownloadAll}>
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Sender Info */}
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={circular.createdBy.avatar} alt={circular.createdBy.name} />
              <AvatarFallback>{circular.createdBy.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{circular.createdBy.name}</div>
              <div className="text-sm text-muted-foreground">Sender</div>
            </div>
          </div>
          
          <Separator />
          
          {/* Message Content */}
          <div className="prose max-w-none dark:prose-invert">
            {circular.message.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {/* Attachments */}
          {circular.files.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Attachments ({circular.files.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {circular.files.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{file.type}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="sr-only">Open</span>
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recipients Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Recipient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground">District</div>
                <div className="font-medium">{circular.district}</div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground">College</div>
                <div className="font-medium">{circular.school}</div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground">Total Recipients</div>
                <div className="font-medium">{circular.recipientCount}</div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard/circular">
              Back to List
            </Link>
          </Button>
          <div className="flex gap-2">
            {circular.status === 'Draft' && (
              <>
                <Button variant="outline">Edit Draft</Button>
                <Button>Send Now</Button>
              </>
            )}
            {circular.status === 'Sent' && (
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Resend
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
