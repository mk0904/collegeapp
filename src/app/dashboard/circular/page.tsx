'use client'

import * as React from 'react'
import {
  FileText,
  Search,
  ChevronDown,
  PlusCircle,
  CalendarIcon,
  GraduationCap,
  MapPin,
  Users,
  Download
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AddCircularModal } from '@/components/add-circular-modal'
import { getAllCirculars } from '@/lib/firebase/circular'
import { getColleges, getUsers } from '@/lib/firebase/firestore'

// Add this type definition for circulars
type Circular = {
  id: string;
  title: string;
  sentDate: string;
  status: 'Sent' | 'Draft';
  recipientCount: number;
  district: string;
  school: string;
}

// Mock data for circulars - in a real app, this would come from your Firebase
const mockCirculars: Circular[] = [
  {
    id: 'circ-001',
    title: 'End of Year Exam Schedule',
    sentDate: '2025-08-20',
    status: 'Sent',
    recipientCount: 145,
    district: 'North District',
    school: 'All Colleges'
  },
  {
    id: 'circ-002',
    title: 'Teacher Training Workshop',
    sentDate: '2025-08-15',
    status: 'Sent',
    recipientCount: 42,
    district: 'Central District',
    school: 'City College'
  },
  {
    id: 'circ-003',
    title: 'Holiday Announcement',
    sentDate: '2025-08-10',
    status: 'Draft',
    recipientCount: 0,
    district: 'All Districts',
    school: 'All Colleges'
  }
];

export default function CircularPage() {
  const { toast } = useToast()
  const [circulars, setCirculars] = React.useState<Circular[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [collegeIdToName, setCollegeIdToName] = React.useState<Record<string, string>>({})
  const [userIdToName, setUserIdToName] = React.useState<Record<string, string>>({})
  
  // Filtering states
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [districtFilter, setDistrictFilter] = React.useState('all')
  const [schoolFilter, setCollegeFilter] = React.useState('all')
  
  // Fetch circulars from Firebase
  const fetchCirculars = React.useCallback(async () => {
    setLoading(true);
    try {
      // Fetch circulars, colleges, and users in parallel
      const [fetchedCirculars, fetchedColleges, fetchedUsers] = await Promise.all([
        getAllCirculars(),
        getColleges(),
        getUsers()
      ]);
      
      // Create mappings
      const collegeMap: Record<string, string> = {};
      fetchedColleges.forEach(college => {
        collegeMap[college.id] = college.name;
      });
      setCollegeIdToName(collegeMap);
      
      const userMap: Record<string, string> = {};
      fetchedUsers.forEach(user => {
        userMap[user.id] = user.name || user.email || 'Unknown';
      });
      setUserIdToName(userMap);
      
      // Convert Firestore data to the Circular type
      const formattedCirculars = fetchedCirculars.map(doc => {
        const data = doc as any;
        console.log('Processing circular:', data.id, 'sentDate:', data.sentDate, 'type:', typeof data.sentDate);
        
        // Format the date if it exists - try sentDate first, then createdAt
        let sentDate = '—';
        const dateField = data.sentDate || data.createdAt;
        if (dateField) {
          try {
            // Handle Firestore timestamp
            let date;
            if (dateField.toDate && typeof dateField.toDate === 'function') {
              // Firestore Timestamp
              date = dateField.toDate();
            } else if (dateField.seconds) {
              // Firestore Timestamp object
              date = new Date(dateField.seconds * 1000);
            } else if (typeof dateField === 'string') {
              // ISO string
              date = new Date(dateField);
            } else if (dateField instanceof Date) {
              // Already a Date object
              date = dateField;
            } else {
              // Fallback to current date
              date = new Date();
            }
            
            // Check if date is valid
            if (!isNaN(date.getTime())) {
              sentDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            } else {
              sentDate = 'Invalid Date';
            }
          } catch (error) {
            console.error('Error formatting date:', error, 'dateField:', dateField);
            sentDate = 'Invalid Date';
          }
        }
        
        // Get recipient info - if recipients array exists, get unique colleges from recipients
        let district = data.district || 'All Districts';
        let school = data.school || 'All Colleges';
        
        // If recipients exist, try to determine college/district from recipient users
        if (data.recipients && Array.isArray(data.recipients) && data.recipients.length > 0) {
          const recipientColleges = new Set<string>();
          const recipientDistricts = new Set<string>();
          
          data.recipients.forEach((userId: string) => {
            const user = fetchedUsers.find(u => u.id === userId);
            if (user) {
              if (user.college || user.collegeId) {
                const collegeId = user.college || user.collegeId || '';
                const collegeName = collegeMap[collegeId] || collegeId;
                if (collegeName && collegeName !== collegeId) {
                  recipientColleges.add(collegeName);
                }
              }
              if (user.district) {
                recipientDistricts.add(user.district);
              }
            }
          });
          
          if (recipientColleges.size > 0) {
            school = recipientColleges.size === 1 
              ? Array.from(recipientColleges)[0]
              : `${recipientColleges.size} Colleges`;
          }
          
          if (recipientDistricts.size > 0) {
            district = recipientDistricts.size === 1
              ? Array.from(recipientDistricts)[0]
              : `${recipientDistricts.size} Districts`;
          }
        }
        
        return {
          id: data.id,
          title: data.title || 'Untitled',
          sentDate: sentDate,
          status: data.status || 'Draft',
          recipientCount: data.recipientCount || (data.recipients?.length || 0),
          district: district,
          school: school
        };
      });
      
      setCirculars(formattedCirculars);
      console.log('Fetched circulars:', formattedCirculars);
    } catch (error) {
      console.error('Error fetching circulars:', error);
      toast({
        title: 'Error',
        description: 'Failed to load circulars. Please try again.',
        variant: 'destructive'
      });
      
      // Fallback to mock data if there's an error
      setCirculars(mockCirculars);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchCirculars();
  }, [fetchCirculars]);
  
  // Get unique filter options from data
  const uniqueDistricts = React.useMemo(() => 
    [...new Set(circulars.map(c => c.district))], 
    [circulars]
  )
  
  const uniqueColleges = React.useMemo(() => 
    [...new Set(circulars.map(c => c.school))], 
    [circulars]
  )

  // Filter circulars based on filter selections
  const filteredCirculars = React.useMemo(() => {
    return circulars.filter(circular => {
      const matchesSearch = circular.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || circular.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesDistrict = districtFilter === 'all' || circular.district === districtFilter;
      const matchesCollege = schoolFilter === 'all' || circular.school === schoolFilter;
      
      return matchesSearch && matchesStatus && matchesDistrict && matchesCollege;
    });
  }, [circulars, searchTerm, statusFilter, districtFilter, schoolFilter]);

  // Handle export functionality
  const handleExport = () => {
    toast({ 
      title: "Export Started", 
      description: "Your circulars are being exported."
    });
    // In a real app, implement actual CSV export logic here
  }

  return (
    <div className="fade-in">
      <AddCircularModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} onCircularCreated={fetchCirculars} />
      <Card className="card-premium rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Circular Management</h2>
              <CardDescription className="text-sm">
                Create and manage circulars for your organization.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} className="btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setIsModalOpen(true)} className="btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Circular
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search circulars by title..."
                className="pl-10 w-full h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full sm:w-auto gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200">
                    <FileText className="mr-2 h-4 w-4" />
                    Status
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-lg">
                  <DropdownMenuCheckboxItem checked={statusFilter === 'all'} onCheckedChange={() => setStatusFilter('all')}>
                    All Status
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilter === 'sent'} onCheckedChange={() => setStatusFilter('sent')}>
                    Sent
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilter === 'draft'} onCheckedChange={() => setStatusFilter('draft')}>
                    Draft
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200">
                    <MapPin className="mr-2 h-4 w-4" />
                    District
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-lg">
                  <DropdownMenuCheckboxItem checked={districtFilter === 'all'} onCheckedChange={() => setDistrictFilter('all')}>
                    All Districts
                  </DropdownMenuCheckboxItem>
                  {uniqueDistricts.map(district => (
                    <DropdownMenuCheckboxItem 
                      key={district} 
                      checked={districtFilter === district} 
                      onCheckedChange={() => setDistrictFilter(district)}
                    >
                      {district}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    College
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem checked={schoolFilter === 'all'} onCheckedChange={() => setCollegeFilter('all')}>
                    All Colleges
                  </DropdownMenuCheckboxItem>
                  {uniqueColleges.map(school => (
                    <DropdownMenuCheckboxItem 
                      key={school} 
                      checked={schoolFilter === school} 
                      onCheckedChange={() => setCollegeFilter(school)}
                    >
                      {school}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="rounded-xl border border-border/50 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Recipients</TableHead>
                  <TableHead className="hidden md:table-cell">District</TableHead>
                  <TableHead className="hidden md:table-cell">College</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredCirculars.map(circular => (
                    <TableRow key={circular.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/circular/${circular.id}`} className="hover:underline">
                          {circular.title}
                        </Link>
                      </TableCell>
                      <TableCell>{circular.sentDate}</TableCell>
                      <TableCell>
                        <Badge variant={circular.status === 'Sent' ? 'default' : 'secondary'}>
                          {circular.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{circular.recipientCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{circular.district}</TableCell>
                      <TableCell className="hidden md:table-cell">{circular.school}</TableCell>
                    </TableRow>
                  ))
                )}
                
                {filteredCirculars.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No circulars found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {filteredCirculars.length} circular(s)
            </div>
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
