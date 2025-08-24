
'use client'

import * as React from 'react'
import {
  ChevronDown,
  Mail,
  MoreHorizontal,
  Search,
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import type { User } from '@/lib/mock-data'
import { useToast } from "@/hooks/use-toast"
import { getUsers, updateUserStatus } from '@/lib/firebase/firestore'
import { Skeleton } from '@/components/ui/skeleton'
import { SendNotificationModal } from '@/components/send-notification-modal'

export default function UsersPage() {
    const { toast } = useToast()
    const [users, setUsers] = React.useState<User[]>([])
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);

    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

    React.useEffect(() => {
      async function fetchUsers() {
        try {
          const fetchedUsers = await getUsers();
          setUsers(fetchedUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast({
            title: "Error",
            description: "Failed to fetch users.",
            variant: "destructive",
          })
        } finally {
          setLoading(false);
        }
      }
      fetchUsers();
    }, [toast]);

    const handleStatusToggle = async (userId: string, currentStatus: 'Active' | 'Inactive') => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            await updateUserStatus(userId, newStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            toast({
                title: "User Status Updated",
                description: `User has been set to ${newStatus}.`,
            })
        } catch (error) {
            console.error("Error updating user status:", error);
            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive",
            })
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUserIds(users.map(user => user.id));
        } else {
            setSelectedUserIds([]);
        }
    }

    const handleSelectUser = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUserIds(prev => [...prev, userId]);
        } else {
            setSelectedUserIds(prev => prev.filter(id => id !== userId));
        }
    }

    const isAllSelected = selectedUserIds.length === users.length && users.length > 0;
    const isIndeterminate = selectedUserIds.length > 0 && selectedUserIds.length < users.length;
  
  return (
    <>
      <SendNotificationModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} selectedUsers={selectedUsers} />
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage your users and view their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users by name or email..."
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Filter by Role <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Admin
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Teacher</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Student</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)} disabled={selectedUserIds.length === 0}>
                <Mail className="mr-2 h-4 w-4" />
                Send Notification ({selectedUserIds.length})
              </Button>
            </div>
          </div>
          <div className="rounded-md border">
              <Table>
              <TableHeader>
                  <TableRow>
                  <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all rows"
                        // @ts-ignore
                        indeterminate={isIndeterminate.toString()}
                      />
                  </TableHead>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">
                      School
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      Phone
                  </TableHead>
                  <TableHead>
                      <span className="sr-only">Actions</span>
                  </TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    users.map(user => (
                      <TableRow key={user.id} data-state={selectedUserIds.includes(user.id) ? 'selected' : ''}>
                          <TableCell>
                              <Checkbox 
                                checked={selectedUserIds.includes(user.id)}
                                onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                                aria-label={`Select row for ${user.name}`}
                              />
                          </TableCell>
                          <TableCell className="font-medium">
                              <div>{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                          </TableCell>
                          <TableCell>
                              <div className="flex items-center gap-2">
                                  <Switch 
                                      id={`status-${user.id}`} 
                                      checked={user.status === 'Active'}
                                      onCheckedChange={() => handleStatusToggle(user.id, user.status)}
                                      aria-label="Toggle user status"
                                  />
                                  <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                              </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                          <TableCell className="hidden md:table-cell">
                              {user.school}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                              {user.phone}
                          </TableCell>
                          <TableCell>
                              <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                  >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                      </TableRow>
                    ))
                  )}
              </TableBody>
              </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {selectedUserIds.length} of {users.length} row(s) selected.
              </div>
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
