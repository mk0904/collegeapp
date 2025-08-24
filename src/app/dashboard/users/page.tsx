
'use client'

import * as React from 'react'
import {
  Mail,
  Search,
  ArrowDown,
  ArrowUp,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import type { User } from '@/lib/mock-data'
import { useToast } from "@/hooks/use-toast"
import { getUsers, updateUserStatus } from '@/lib/firebase/firestore'
import { Skeleton } from '@/components/ui/skeleton'
import { SendNotificationModal } from '@/components/send-notification-modal'

type SortableKeys = keyof User;

export default function UsersPage() {
    const { toast } = useToast()
    const [users, setUsers] = React.useState<User[]>([])
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortConfig, setSortConfig] = React.useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);

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
            setSelectedUserIds(filteredUsers.map(user => user.id));
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
    
    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedUsers = React.useMemo(() => {
        let sortableUsers = [...users];
        if (sortConfig !== null) {
            sortableUsers.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableUsers;
    }, [users, sortConfig]);

    const filteredUsers = sortedUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAllSelected = selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0;
    const isIndeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length;
  
  const getSortIcon = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    if (sortConfig.direction === 'ascending') return <ArrowUp className="h-4 w-4" />;
    return <ArrowDown className="h-4 w-4" />;
  };
  
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
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
                  <TableHead className="min-w-[150px]">
                    <Button variant="ghost" onClick={() => requestSort('name')} className="px-0">
                        Name {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('status')} className="px-0">
                        Status {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button variant="ghost" onClick={() => requestSort('role')} className="px-0">
                        Role {getSortIcon('role')}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                     <Button variant="ghost" onClick={() => requestSort('school')} className="px-0">
                        School {getSortIcon('school')}
                    </Button>
                  </TableHead>
                   <TableHead className="hidden md:table-cell">
                     <Button variant="ghost" onClick={() => requestSort('district')} className="px-0">
                        District {getSortIcon('district')}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                     <Button variant="ghost" onClick={() => requestSort('phone')} className="px-0">
                        Phone {getSortIcon('phone')}
                    </Button>
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
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    filteredUsers.map(user => (
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
                              {user.district}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                              {user.phone}
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
