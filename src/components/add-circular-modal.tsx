'use client'

import * as React from 'react'
import {
  Upload,
  ChevronDown,
  Users,
  MapPin,
  School2,
  ShieldCheck,
  Loader2
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
import { getAuth } from 'firebase/auth'
import { addCircular } from '@/lib/firebase/circular'
import { getUsers } from '@/lib/firebase/firestore'
import { uploadFileToStorage } from '@/lib/firebase/storage'
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
import type { User } from '@/lib/mock-data'

interface AddCircularModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCircularCreated?: () => void;
}

export function AddCircularModal({ isOpen, onOpenChange, onCircularCreated }: AddCircularModalProps) {
  const { toast } = useToast()
  const [title, setTitle] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [loading, setLoading] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [users, setUsers] = React.useState<User[]>([])
  
  // Filter states
  const [roleFilter, setRoleFilter] = React.useState('all')
  const [districtFilter, setDistrictFilter] = React.useState('all')
  const [collegeFilter, setCollegeFilter] = React.useState('all')
  
  // Initially no filters applied, so start with empty selection
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([])
  
  // Fetch users when modal opens
  React.useEffect(() => {
    async function fetchUsers() {
      if (isOpen) {
        setLoading(true)
        try {
          const fetchedUsers = await getUsers()
          setUsers(fetchedUsers)
        } catch (error) {
          console.error('Error fetching users:', error)
          toast({
            title: "Error",
            description: "Failed to load users. Please try again.",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchUsers()
  }, [isOpen, toast])
  
  // Extract unique values for filters
  const uniqueRoles = React.useMemo(() => [...new Set(users.map(u => u.role))], [users])
  const uniqueDistricts = React.useMemo(() => [...new Set(users.map(u => u.district).filter(Boolean))], [users])
  const uniqueColleges = React.useMemo(() => [...new Set(users.map(u => u.college).filter(Boolean))], [users])

  // Filter users based on selected filters
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesDistrict = districtFilter === 'all' || user.district === districtFilter
      const matchesCollege = collegeFilter === 'all' || user.college === collegeFilter
      const isActive = user.status === 'Active' || user.status === undefined // Consider users active by default if status is not set
      
      return matchesRole && matchesDistrict && matchesCollege && isActive
    })
  }, [users, roleFilter, districtFilter, collegeFilter])
  
  // Select all filtered users when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // When modal opens, select all users matching current filters
      setSelectedUserIds(filteredUsers.map(user => user.id))
    } else {
      // Reset form when modal closes
      setTitle('')
      setMessage('')
      setFiles([])
      // Reset selections
      setSelectedUserIds([])
    }
  }, [isOpen, filteredUsers])
  
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
  
  // Handle form submission
  const handleSubmit = async () => {
    console.log('Creating circular:', { title, message, files: files.length, recipients: selectedUserIds.length });
    
    // Form validation
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
      setIsUploading(true)
      
      // Show loading toast
      toast({
        title: "Processing",
        description: "Uploading files and creating circular...",
      });
      
      // Get current user
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error("You must be logged in to create a circular");
      }
      
      // Upload files to Firebase Storage
      let fileObjects = [];
      if (files.length > 0) {
        const uploadPromises = Array.from(files).map(async (file, index) => {
          try {
            const filePath = `circulars/${Date.now()}_${file.name}`;
            const downloadURL = await uploadFileToStorage(filePath, file);
            
            return {
              name: file.name,
              type: file.type,
              size: file.size,
              url: downloadURL,
              path: filePath
            };
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            throw new Error(`Failed to upload ${file.name}`);
          }
        });
        
        // Wait for all uploads to complete
        fileObjects = await Promise.all(uploadPromises);
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
        description: `Circular with ${files.length} attachment(s) sent to ${selectedUserIds.length} recipient(s).`
      })
      
      // Refresh the circulars list
      if (onCircularCreated) {
        onCircularCreated();
      }
      
      // Close modal after sending
      onOpenChange(false)
      setIsUploading(false)
    } catch (error) {
      console.error('Error creating circular:', error);
      toast({
        title: "Error",
        description: "Failed to create circular. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false)
    }
  }
  
  const isAllSelected = selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0
  const isIndeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submitted, calling handleSubmit');
          handleSubmit();
        }}>
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
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="file">Attachments (Multiple files allowed)</Label>
                  <div className="mt-1 flex items-center">
                    <Label 
                      htmlFor="file" 
                      className="cursor-pointer border border-dashed border-gray-300 rounded-md px-4 py-2 w-full flex items-center justify-center"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {files.length > 0 ? `${files.length} file(s) selected` : "Select Files"}
                    </Label>
                    <Input 
                      id="file" 
                      type="file" 
                      multiple
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </div>
                  {files.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {files.length} file(s) selected
                    </div>
                  )}
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
                          indeterminate={isIndeterminate}
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
              <Button variant="outline" type="button">Save as Draft</Button>
              <Button type="submit" onClick={handleSubmit} disabled={isUploading}>
                {isUploading ? "Sending..." : "Send Circular"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
