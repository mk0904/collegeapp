'use client'

import * as React from 'react'
import {
  Upload,
  ChevronDown,
  Users,
  MapPin,
  School2,
  ShieldCheck,
  Loader2,
  X,
  FileText,
  Image,
  File
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
import { uploadMultipleFilesToUploadThing, testUploadThingUrl } from '@/lib/uploadthing-client'
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

  // Filter users based on selected filters
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase()
      const matchesDistrict = districtFilter === 'all' || user.district === districtFilter
      const matchesCollege = collegeFilter === 'all' || user.college === collegeFilter
      return matchesRole && matchesDistrict && matchesCollege
    })
  }, [users, roleFilter, districtFilter, collegeFilter])
  
  // Get unique values for filter options
  const uniqueRoles = React.useMemo(() => 
    [...new Set(users.map(user => user.role))], 
    [users]
  )
  
  const uniqueDistricts = React.useMemo(() => 
    [...new Set(users.map(user => user.district))], 
    [users]
  )
  
  const uniqueColleges = React.useMemo(() => 
    [...new Set(users.map(user => user.college))], 
    [users]
  )

  // Select all users by default when modal opens
  React.useEffect(() => {
    if (isOpen && users.length > 0 && selectedUserIds.length === 0) {
      setSelectedUserIds(users.map(user => user.id))
    }
  }, [isOpen, users, selectedUserIds.length])

  // Auto-filter selected users when filters change
  React.useEffect(() => {
    if (selectedUserIds.length > 0) {
      // Keep only selected users that match current filters
      const filteredUserIds = filteredUsers.map(user => user.id)
      const validSelectedIds = selectedUserIds.filter(id => filteredUserIds.includes(id))
      
      // Only update if there's a change to avoid infinite loops
      if (validSelectedIds.length !== selectedUserIds.length) {
        setSelectedUserIds(validSelectedIds)
      }
    }
  }, [roleFilter, districtFilter, collegeFilter, filteredUsers, selectedUserIds])

      // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setMessage('')
      setFiles([])
      // Reset selections
      setSelectedUserIds([])
    }
  }, [isOpen])
  
  // Handle file selection - append new files instead of replacing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prevFiles => [...prevFiles, ...newFiles])
    }
    // Clear the input so the same file can be selected again if needed
    e.target.value = ''
  }

  // Handle removing a specific file
  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove))
  }

  // Get file icon based on file type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />
    } else {
      return <File className="h-4 w-4 text-gray-500" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Handle user selection - works with filtered users only
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all filtered users
      setSelectedUserIds(filteredUsers.map(user => user.id))
    } else {
      // Deselect all filtered users
      const filteredUserIds = filteredUsers.map(user => user.id)
      setSelectedUserIds(selectedUserIds.filter(id => !filteredUserIds.includes(id)))
    }
  }
  
  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
        setSelectedUserIds(prev => [...prev, userId])
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId))
    }
  }
  
  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }
    
    if (selectedUserIds.length === 0) {
      toast({
        title: "No Recipients",
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
      
      // Upload multiple files to UploadThing
      let fileObjects: Array<{
        name: string;
        type: string;
        size: number;
        url: string;
        key?: string;
      }> = [];
      if (files.length > 0) {
        console.log(`Starting upload of ${files.length} files to UploadThing...`);
        
        try {
          // Upload all files to UploadThing
          const uploadResults = await uploadMultipleFilesToUploadThing(
            Array.from(files)
          );
          
          // Convert UploadThing results to the format expected by addCircular
          fileObjects = uploadResults.map((result) => ({
            name: result.name,
            type: result.type,
            size: result.size,
            url: result.url,
            key: result.key
          }));
          
          console.log('All files uploaded successfully to UploadThing:', fileObjects);
          
          // Test URLs to make sure they work
          console.log('Testing uploaded URLs...');
          for (const file of fileObjects) {
            const isAccessible = await testUploadThingUrl(file.url);
            console.log(`URL for ${file.name}: ${isAccessible ? '✅ Accessible' : '❌ Not accessible'}`);
            if (!isAccessible) {
              console.warn(`Warning: URL for ${file.name} is not accessible: ${file.url}`);
            }
          }
          
          // Show success message
          toast({
            title: "Files Uploaded",
            description: `Successfully uploaded ${files.length} file(s) to UploadThing.`,
          });
          
        } catch (error) {
          console.error('UploadThing upload failed:', error);
          
          // Show specific error message
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast({
            title: "Upload Failed",
            description: `Failed to upload files to UploadThing: ${errorMessage}`,
            variant: "destructive",
          });
          
          throw new Error(`File upload failed: ${errorMessage}`);
        }
      }
      
      // Validate all data before saving
      console.log('Validating circular data before save...');
      console.log('Title:', title);
      console.log('Message:', message);
      console.log('File objects:', fileObjects);
      console.log('Selected user IDs:', selectedUserIds);
      console.log('Current user ID:', currentUser.uid);
      
      // Create circular data with strict validation
      const circular = {
        title: title || '',
        message: message || '',
        files: (fileObjects || []).map(file => ({
          name: file.name || '',
          url: file.url || '',
          type: file.type || '',
          size: file.size || 0
        })),
        attachments: (fileObjects || []).map(file => {
          const attachment: any = {
            name: file.name || '',
            url: file.url || '',
            type: file.type || '',
            size: file.size || 0
          };
          
          // Only add UploadThing metadata if they exist
          if (file.key && file.key !== undefined) attachment.key = file.key;
          
          return attachment;
        }),
        recipients: selectedUserIds || [],
        createdBy: currentUser.uid || ''
      };
      
      // Final validation - check for any undefined values
      const validateData = (obj: any, path = ''): void => {
        for (const key in obj) {
          const currentPath = path ? `${path}.${key}` : key;
          if (obj[key] === undefined) {
            throw new Error(`Undefined value found at path: ${currentPath}`);
          }
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            validateData(obj[key], currentPath);
          }
        }
      };
      
      console.log('Validating circular data structure...');
      validateData(circular);
      console.log('✅ All data validated successfully');
      
      // Add circular to Firebase
      const result = await addCircular(circular);
      console.log('Circular created successfully:', result);
      
      toast({
        title: "Success",
        description: "Circular created and sent successfully!",
      });
      
      // Call the callback to refresh the circulars list
      if (onCircularCreated) {
        onCircularCreated();
      }
      
      // Close modal after sending
      onOpenChange(false)
      setIsUploading(false)
    } catch (error) {
      console.error('Error creating circular:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to create circular. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Firebase')) {
          errorMessage = `Database error: ${error.message}`;
        } else if (error.message.includes('Failed to upload')) {
          errorMessage = `File upload error: ${error.message}`;
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsUploading(false)
    }
  }
  
  // Check if all filtered users are selected
  const filteredUserIds = filteredUsers.map(user => user.id)
  const selectedFilteredUsers = selectedUserIds.filter(id => filteredUserIds.includes(id))
  const isAllFilteredSelected = selectedFilteredUsers.length === filteredUsers.length && filteredUsers.length > 0
  const isIndeterminate = selectedFilteredUsers.length > 0 && selectedFilteredUsers.length < filteredUsers.length
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Create Circular</DialogTitle>
              <DialogDescription>
                Send announcements and documents to your organization.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Main Content - Two Column Layout */}
          <div className="flex-1 flex min-h-0 overflow-y-auto">
            {/* Left Column - Circular Details */}
            <div className="w-1/2 p-6 border-r space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                <Input 
                  id="title" 
                  placeholder="Enter circular title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">Message *</Label>
                <Textarea 
                  id="message" 
                  placeholder="Enter your message here..." 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 resize-none"
                  required
                />
              </div>
              
              {/* File Attachments */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Attachments</Label>
                <div className="mt-1">
                    <Label 
                      htmlFor="file" 
                    className="cursor-pointer border-2 border-dashed border-border rounded-lg px-6 py-4 w-full flex flex-col items-center justify-center hover:border-primary hover:bg-accent transition-colors"
                  >
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">
                      {files.length > 0 ? `Add More Files (${files.length} selected)` : "Click to Add Files"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Supports images, PDFs, and documents</span>
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
                
                {/* Selected Files - Compact List */}
                  {files.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                    <div className="text-xs font-medium text-muted-foreground">
                      Selected Files ({files.length})
                    </div>
                    {files.map((file, index) => (
                      <div 
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    </div>
                  )}
              </div>
            </div>
            
            {/* Right Column - Recipients */}
            <div className="w-1/2 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Recipients</h3>
                </div>
                <div className="px-3 py-1 bg-accent rounded-full">
                  <span className="text-sm font-medium text-muted-foreground">
                    {selectedUserIds.length} of {filteredUsers.length} selected
                  </span>
                </div>
              </div>
              
              {/* Filter Controls */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">
                  Filter Recipients
                </div>
                <div className="grid grid-cols-3 gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={districtFilter} onValueChange={setDistrictFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {uniqueDistricts.map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <School2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="School" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {uniqueColleges.map(college => (
                      <SelectItem key={college} value={college}>{college}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
              </div>
              
              {/* Recipients List */}
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <div className="p-3 border-b bg-accent">
                  <div className="flex items-center space-x-3">
                        <Checkbox 
                      checked={isAllFilteredSelected}
                          onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      Select All Filtered ({selectedFilteredUsers.length}/{filteredUsers.length})
                    </span>
                  </div>
                </div>
                <div className="divide-y">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="p-3 flex items-center space-x-3">
                        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    ))
                    ) : (
                      filteredUsers.map(user => (
                      <div key={user.id} className="p-3 flex items-center space-x-3 hover:bg-accent transition-colors">
                            <Checkbox 
                              checked={selectedUserIds.includes(user.id)}
                          onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center space-x-1">
                            <span>{user.role}</span>
                            <span>•</span>
                            <span>{user.district}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {user.college}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
        
        {/* Footer - Always at bottom */}
        <DialogFooter className="px-6 py-4 border-t bg-accent flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              {files.length > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-accent rounded-full">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {files.length} file{files.length !== 1 ? 's' : ''} attached
                  </span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Ready to send to {selectedUserIds.length} recipient{selectedUserIds.length !== 1 ? 's' : ''}
                {filteredUsers.length !== users.length && (
                  <span className="ml-2 text-xs">(filtered from {users.length} total)</span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
            <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
            </DialogClose>
              <Button 
                onClick={handleSubmit}
                disabled={isUploading || selectedUserIds.length === 0}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Send Circular</span>
                  </div>
                )}
              </Button>
            </div>
            </div>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}