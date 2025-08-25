'use client'

import * as React from 'react'
import {
  Upload,
  CheckCircle,
  ChevronDown,
  Users,
  MapPin,
  School2,
  ShieldCheck,
  CalendarRange,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'

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
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'Teacher', college: 'City High School', district: 'North District' },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', role: 'Admin', college: 'Valley College', district: 'Central District' },
  { id: '3', name: 'James Wilson', email: 'james@example.com', role: 'Teacher', college: 'City High School', district: 'North District' },
  { id: '4', name: 'Sarah Chen', email: 'sarah@example.com', role: 'Student', college: 'Valley College', district: 'Central District' },
  { id: '5', name: 'Michael Brown', email: 'michael@example.com', role: 'Teacher', college: 'East Academy', district: 'East District' }
];

interface AddCircularModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCircularModal({ isOpen, onOpenChange }: AddCircularModalProps) {
  const { toast } = useToast()
  const [title, setTitle] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [scheduledDate, setScheduledDate] = React.useState<Date>()
  const [files, setFiles] = React.useState<File[]>([])
  
  // Filter states
  const [roleFilter, setRoleFilter] = React.useState('all')
  const [districtFilter, setDistrictFilter] = React.useState('all')
  const [collegeFilter, setCollegeFilter] = React.useState('all')
  
  // Initially no filters applied, so start with empty selection
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
  
  // Select all filtered users when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // When modal opens, select all users matching current filters
      setSelectedUserIds(filteredUsers.map(user => user.id))
    } else {
      // Reset form when modal closes
      setTitle('')
      setMessage('')
      setScheduledDate(undefined)
      setFiles([])
      // Reset selections
      setSelectedUserIds([])
    }
  }, [isOpen, filteredUsers])

  // Update selected users when filters change
  React.useEffect(() => {
    // When filters change, only keep selected users who still match the filters
    setSelectedUserIds(prev => 
      prev.filter(id => 
        filteredUsers.some(user => user.id === id)
      )
    )
  }, [filteredUsers])
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }
  
  // Handle user selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select users that match current filters
      setSelectedUserIds(filteredUsers.map(user => user.id))
    } else {
      setSelectedUserIds([])
    }
  }
  
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      // Make sure the user exists in the filtered list before adding
      if (filteredUsers.some(user => user.id === userId)) {
        setSelectedUserIds(prev => [...prev, userId])
      }
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId))
    }
  }

interface AddCircularModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCircularModal({ isOpen, onOpenChange }: AddCircularModalProps) {
  const { toast } = useToast()
  const [title, setTitle] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [scheduledDate, setScheduledDate] = React.useState<Date>()
  const [files, setFiles] = React.useState<File[]>([])
  
  // Filter states
  const [roleFilter, setRoleFilter] = React.useState('all')
  const [districtFilter, setDistrictFilter] = React.useState('all')
  const [collegeFilter, setCollegeFilter] = React.useState('all')
  
  // Initially no filters applied, so start with empty selection
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

  // Update selected users when filters change
  React.useEffect(() => {
    // When filters change, only keep selected users who still match the filters
    setSelectedUserIds(prev => 
      prev.filter(id => 
        filteredUsers.some(user => user.id === id)
      )
    );
  }, [filteredUsers]);
  
  // Select all filtered users when modal opens, reset when closes
  React.useEffect(() => {
    if (isOpen) {
      // When modal opens, select all users matching current filters
      setSelectedUserIds(filteredUsers.map(user => user.id))
    } else {
      // Reset form when modal closes
      setTitle('')
      setMessage('')
      setScheduledDate(undefined)
      setFiles([])
      // Don't reset filters but clear selections
      setSelectedUserIds([])
    }
  }, [isOpen, filteredUsers])
    return mockUsers.filter(user => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesDistrict = districtFilter === 'all' || user.district === districtFilter
      const matchesCollege = collegeFilter === 'all' || user.college === collegeFilter
      
      return matchesRole && matchesDistrict && matchesCollege
    })
  }, [roleFilter, districtFilter, collegeFilter])
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }
  
  // Handle user selection - only for filtered users
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select users that match current filters
      setSelectedUserIds(filteredUsers.map(user => user.id))
    } else {
      setSelectedUserIds([])
    }
  }
  
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      // Make sure the user exists in the filtered list before adding
      if (filteredUsers.some(user => user.id === userId)) {
        setSelectedUserIds(prev => [...prev, userId])
      }
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId))
    }
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Here you would send the circular data to your backend
    toast({
      title: "Circular Created",
      description: `Circular sent to ${selectedUserIds.length} recipient(s).`
    })
    
    // Close modal after sending
    onOpenChange(false)
  }
  
  const isAllSelected = selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0
  const isIndeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Circular</DialogTitle>
            <DialogDescription>
              Create a new circular and select recipients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
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
                <div>
                  <Label htmlFor="file">Attachment (Image/PDF)</Label>
                  <div className="mt-1 flex items-center">
                    <Label 
                      htmlFor="file" 
                      className="cursor-pointer border border-dashed border-gray-300 rounded-md px-4 py-2 w-full flex items-center justify-center"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {files.length > 0 ? files[0].name : "Select File"}
                    </Label>
                    <Input 
                      id="file" 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </div>
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
                    <School2 className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select School" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {uniqueColleges.map(college => (
                      <SelectItem key={college} value={college}>{college}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Recipients Table */}
              <div className="rounded-md border">
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
                      <TableHead className="hidden md:table-cell">School</TableHead>
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
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <div className="flex gap-2">
              <Button variant="outline">Save as Draft</Button>
              <Button type="submit">Send Circular</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
