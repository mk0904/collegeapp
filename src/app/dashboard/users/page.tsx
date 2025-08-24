
'use client'

import * as React from 'react'
import {
  Mail,
  Search,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ArrowUpDown,
  Download,
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
import type { User, School } from '@/lib/mock-data'
import { useToast } from "@/hooks/use-toast"
import { getUsers, updateUserStatus, getSchools } from '@/lib/firebase/firestore'
import { Skeleton } from '@/components/ui/skeleton'
import { SendNotificationModal } from '@/components/send-notification-modal'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type SortableKeys = keyof User;
type SortDirection = 'ascending' | 'descending';

export default function UsersPage() {
    const { toast } = useToast()
    const [users, setUsers] = React.useState<User[]>([])
    const [schools, setSchools] = React.useState<School[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
    
    // Filtering states
    const [searchTerm, setSearchTerm] = React.useState('');
    const [roleFilter, setRoleFilter] = React.useState('all');
    const [schoolFilter, setSchoolFilter] = React.useState('all');
    const [districtFilter, setDistrictFilter] = React.useState('all');

    const [sortConfig, setSortConfig] = React.useState<{ key: SortableKeys; direction: SortDirection } | null>({ key: 'status', direction: 'ascending'});

    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

    React.useEffect(() => {
      async function fetchData() {
        try {
          const [fetchedUsers, fetchedSchools] = await Promise.all([
            getUsers(),
            getSchools(),
          ]);
          setUsers(fetchedUsers);
          setSchools(fetchedSchools);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({
            title: "Error",
            description: "Failed to fetch user or school data.",
            variant: "destructive",
          })
        } finally {
          setLoading(false);
        }
      }
      fetchData();
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
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const uniqueRoles = React.useMemo(() => [...new Set(users.map(u => u.role))], [users]);
    const uniqueDistricts = React.useMemo(() => [...new Set(users.map(u => u.district))], [users]);


    const sortedUsers = React.useMemo(() => {
        let sortableUsers = [...users];
        if (sortConfig !== null) {
            sortableUsers.sort((a, b) => {
                // Default sort by status: Active first
                if (sortConfig.key === 'status') {
                    if (a.status === 'Active' && b.status === 'Inactive') return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (a.status === 'Inactive' && b.status === 'Active') return sortConfig.direction === 'ascending' ? 1 : -1;
                }

                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                  return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }

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
    
    const filteredUsers = React.useMemo(() => {
        return sortedUsers.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesSchool = schoolFilter === 'all' || user.school === schoolFilter;
            const matchesDistrict = districtFilter === 'all' || user.district === districtFilter;
            
            return matchesSearch && matchesRole && matchesSchool && matchesDistrict;
        });
    }, [sortedUsers, searchTerm, roleFilter, schoolFilter, districtFilter]);

    const handleExport = () => {
        if (filteredUsers.length === 0) {
            toast({ title: "No Users to Export", description: "The current filter has no users to export.", variant: "destructive" });
            return;
        }

        const csvHeader = "ID,Name,Email,Phone,Status,Role,School,District,Designation\n";
        const csvRows = filteredUsers.map(user => {
            const row = [
                user.id,
                `"${user.name}"`,
                user.email,
                user.phone,
                user.status,
                user.role,
                `"${user.school}"`,
                `"${user.district}"`,
                `"${user.designation || ''}"`
            ];
            return row.join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Export successful", description: `${filteredUsers.length} users have been exported.`});
    }

    const isAllSelected = selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0;
    const isIndeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length;
  
  const SortableHeader = ({
    column,
    label,
  }: {
    column: SortableKeys;
    label: React.ReactNode;
  }) => {
    const isSorted = sortConfig?.key === column;
    const isAscending = sortConfig?.direction === 'ascending';
    
    return (
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => requestSort(column)}>
        {label}
        {isSorted ? (
          isAscending ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    );
  };

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'Admin': return 'default';
      case 'Teacher': return 'secondary';
      case 'Student': return 'outline';
      default: return 'outline';
    }
  }
  
  return (
    <>
      <SendNotificationModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} selectedUsers={selectedUsers} />
      <Card>
        <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        Manage your users and view their details.
                    </CardDescription>
                </div>
                <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users by name or email..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <div className="flex w-full sm:w-auto gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto capitalize">Role <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem checked={roleFilter === 'all'} onCheckedChange={() => setRoleFilter('all')}>All Roles</DropdownMenuCheckboxItem>
                        {uniqueRoles.map(role => <DropdownMenuCheckboxItem key={role} checked={roleFilter === role} onCheckedChange={() => setRoleFilter(role)} className="capitalize">{role.toLowerCase()}</DropdownMenuCheckboxItem>)}
                    </DropdownMenuContent>
                </DropdownMenu>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">School <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem checked={schoolFilter === 'all'} onCheckedChange={() => setSchoolFilter('all')}>All Schools</DropdownMenuCheckboxItem>
                        {schools.map(school => <DropdownMenuCheckboxItem key={school.id} checked={schoolFilter === school.name} onCheckedChange={() => setSchoolFilter(school.name)}>{school.name}</DropdownMenuCheckboxItem>)}
                    </DropdownMenuContent>
                </DropdownMenu>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">District <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem checked={districtFilter === 'all'} onCheckedChange={() => setDistrictFilter('all')}>All Districts</DropdownMenuCheckboxItem>
                         {uniqueDistricts.map(district => <DropdownMenuCheckboxItem key={district} checked={districtFilter === district} onCheckedChange={() => setDistrictFilter(district)}>{district}</DropdownMenuCheckboxItem>)}
                    </DropdownMenuContent>
                </DropdownMenu>
              <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)} disabled={selectedUserIds.length === 0} className="w-full sm:w-auto">
                <Mail className="mr-2 h-4 w-4" />
                Send ({selectedUserIds.length})
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
                  <TableHead>
                     <SortableHeader column="name" label="Name" />
                  </TableHead>
                  <TableHead>
                     <SortableHeader column="status" label="Status" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="role" label="Role" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="school" label="School" />
                  </TableHead>
                   <TableHead className="hidden md:table-cell">
                      <SortableHeader column="district" label="District" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="phone" label="Phone" />
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
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
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
                           <TableCell className="hidden md:table-cell">
                              <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">{user.role.toLowerCase()}</Badge>
                           </TableCell>
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
                {selectedUserIds.length} of {filteredUsers.length} row(s) selected.
              </div>
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
