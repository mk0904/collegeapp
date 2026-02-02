'use client'

import * as React from 'react'
import {
  Upload,
  CheckCircle,
  ChevronDown,
  Users,
  MapPin,
  GraduationCap,
  ArrowLeft,
  ShieldCheck,
  CalendarRange
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { MultiFileUpload, UploadedFile } from '@/components/ui/multi-file-upload'
import { getAuth } from 'firebase/auth'
import { addCircular } from '@/lib/firebase/circular'
import { uploadFileToStorage } from '@/lib/firebase/storage'

// Mock user types for recipient selection
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  college: string;
  district: string;
}

// Mock data for users
const mockUsers: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'Teacher', college: 'City High College', district: 'North District' },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', role: 'Admin', college: 'Valley College', district: 'Central District' },
  { id: '3', name: 'James Wilson', email: 'james@example.com', role: 'Teacher', college: 'City High College', district: 'North District' },
  { id: '4', name: 'Sarah Chen', email: 'sarah@example.com', role: 'Student', college: 'Valley College', district: 'Central District' },
  { id: '5', name: 'Michael Brown', email: 'michael@example.com', role: 'Teacher', college: 'East Academy', district: 'East District' }
];

export default function AddCircularPage() {
  const { toast } = useToast()
  const [title, setTitle] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [scheduledDate, setScheduledDate] = React.useState<Date>()
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
  
  // Filter states
  const [roleFilter, setRoleFilter] = React.useState('all')
  const [districtFilter, setDistrictFilter] = React.useState('all')
  const [collegeFilter, setCollegeFilter] = React.useState('all')
  
  // Selected recipients
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([])
  
  // Extract unique values for filters
  const uniqueRoles = React.useMemo(() => [...new Set(mockUsers.map(u => u.role))], [])
  const uniqueDistricts = React.useMemo(() => [...new Set(mockUsers.map(u => u.district))], [])
  const uniqueColleges = React.useMemo(() => [...new Set(mockUsers.map(u => u.college))], [])
  
  // Filter users based on selected filters
  const filteredUsers = React.useMemo(() => {
    return mockUsers.filter(user => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesDistrict = districtFilter === 'all' || user.district === districtFilter
      const matchesCollege = collegeFilter === 'all' || user.college === collegeFilter
      
      return matchesRole && matchesDistrict && matchesCollege
    })
  }, [roleFilter, districtFilter, collegeFilter])
  
  // Handle user selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(filteredUsers.map(user => user.id))
    } else {
      setSelectedUserIds([])
    }
  }
  
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId])
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId))
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a circular title.",
        variant: "destructive"
      })
      return
    }
    
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a circular message.",
        variant: "destructive"
      })
      return
    }
    
    if (selectedUserIds.length === 0) {
      toast({
        title: "Recipients Required",
        description: "Please select at least one recipient.",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Get current user
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error("You must be logged in to create a circular");
      }
      
      // Upload files to Firebase Storage if there are any
      let fileObjects = [];
      if (uploadedFiles.length > 0) {
        // Files are already uploaded to Firebase Storage, just use their data
        fileObjects = uploadedFiles.map((file) => ({
          name: file.name,
          type: file.type,
          size: 0, // Size not stored in this format
          url: file.url,
          path: file.id // Use Firebase Storage path
        }));
      }
      
      // Save circular to Firestore
      const circular = {
        title,
        message,
        files: fileObjects,
        recipients: selectedUserIds,
        createdBy: currentUser.uid
      };
      
      await addCircular(circular);
      
      toast({
        title: "Circular Created",
        description: `Circular with ${uploadedFiles.length} attachment(s) sent to ${selectedUserIds.length} recipient(s).`
      });
      
      // Redirect back to circulars list
      window.location.href = '/dashboard/circular';
    } catch (error) {
      console.error('Error creating circular:', error);
      toast({
        title: "Error",
        description: "Failed to create circular. Please try again.",
        variant: "destructive"
      });
    }
  }
  
  const isAllSelected = selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0
  const isIndeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length
  
  return (
    <>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/circular">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Circulars
          </Link>
        </Button>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Add Circular</CardTitle>
            <CardDescription>
              Create a new circular and select recipients.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Circular Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter circular title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Enter circular message" 
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <MultiFileUpload 
                    label="Attachments (Images/Documents/PDFs)" 
                    value={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    maxFiles={5}
                  />
                </div>
                
                <div>
                  <Label>Schedule (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left mt-1"
                      >
                        <CalendarRange className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Schedule for later"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recipients</h3>
              
              {/* Filter Controls */}
              <div className="flex flex-wrap gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[200px]">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={districtFilter} onValueChange={setDistrictFilter}>
                  <SelectTrigger className="w-[200px]">
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {uniqueDistricts.map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select College" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem>
                    {uniqueColleges.map(college => (
                      <SelectItem key={college} value={college}>{college}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Recipients Table */}
              <div className="rounded-xl border border-border/50 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox 
                          checked={isAllSelected} 
                          // @ts-ignore - 'indeterminate' is a valid prop for Checkbox
                          indeterminate={isIndeterminate.toString()}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all recipients"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Role</TableHead>
                      <TableHead className="hidden md:table-cell">College</TableHead>
                      <TableHead className="hidden md:table-cell">District</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No recipients match the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedUserIds.includes(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                              aria-label={`Select ${user.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="capitalize">{user.role.toLowerCase()}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{user.college}</TableCell>
                          <TableCell className="hidden md:table-cell">{user.district}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {selectedUserIds.length} of {filteredUsers.length} recipient(s) selected.
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline" asChild>
              <Link href="/dashboard/circular">Cancel</Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Save as Draft</Button>
              <Button type="submit">Send Circular</Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </>
  )
}
