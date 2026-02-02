
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
  ShieldCheck,
  GraduationCap,
  MapPin,
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
import type { User, College } from '@/lib/mock-data'
import { useToast } from "@/hooks/use-toast"
import { getUsers, updateUserStatus, getColleges } from '@/lib/firebase/firestore'
import { Skeleton } from '@/components/ui/skeleton'
import { SendNotificationModal } from '@/components/send-notification-modal'
import { auth } from '@/lib/firebase'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type SortableKeys = keyof User;
type SortDirection = 'ascending' | 'descending';

export default function UsersPage() {
    const { toast } = useToast()
    const [users, setUsers] = React.useState<User[]>([])
    const [colleges, setColleges] = React.useState<College[]>([]);
    const [collegeIdToName, setCollegeIdToName] = React.useState<Record<string, string>>({})
    const [collegeIdToDistrict, setCollegeIdToDistrict] = React.useState<Record<string, string>>({})
    const [loading, setLoading] = React.useState(true);
    const [currentUser, setCurrentUser] = React.useState<any>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
    
    // Filtering states
    const [searchTerm, setSearchTerm] = React.useState('');
    const [roleFilter, setRoleFilter] = React.useState('all');
    const [collegeFilter, setCollegeFilter] = React.useState('all');
    const [districtFilter, setDistrictFilter] = React.useState('all');

    const [sortConfig, setSortConfig] = React.useState<{ key: SortableKeys; direction: SortDirection } | null>({ key: 'active', direction: 'descending'});

    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

    React.useEffect(() => {
      let cancelled = false;
      async function fetchData() {
        try {
          // Show cached data immediately if available
          const cachedUsers = await getUsers();
          const cachedColleges = await getColleges();
          
          if (!cancelled) {
            setUsers(cachedUsers);
            setColleges(cachedColleges);
          }
          
          // Fetch fresh data in background
          const [fetchedUsers, fetchedColleges] = await Promise.all([
            getUsers(),
            getColleges(),
          ]);
          
          if (!cancelled) {
            setUsers(fetchedUsers);
            setColleges(fetchedColleges);
          
            // Create mapping from college ID to name and district
            const idToName: Record<string, string> = {};
            const idToDistrict: Record<string, string> = {};
            fetchedColleges.forEach(college => {
              idToName[college.id] = college.name;
              if (college.district) {
                idToDistrict[college.id] = college.district;
              }
            });
            setCollegeIdToName(idToName);
            setCollegeIdToDistrict(idToDistrict);
          }
        } catch (error) {
          if (!cancelled) {
            console.error("Error fetching data:", error);
            toast({
            title: "Error",
            description: "Failed to fetch user or college data.",
            variant: "destructive",
          })
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }
      fetchData();
      return () => { cancelled = true; };
    }, [toast]);

    // Get current user
    React.useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
      });
      return () => unsubscribe();
    }, []);

    const handleStatusToggle = async (userId: string, currentActive: boolean) => {
        const newActive = !currentActive;
        try {
            await updateUserStatus(userId, newActive ? 'Active' : 'Inactive');
            setUsers(users.map(u => u.id === userId ? { 
                ...u, 
                active: newActive,
                status: newActive ? 'Active' : 'Inactive' // Update legacy field too
            } : u));
            toast({
                title: "User Status Updated",
                description: `User has been ${newActive ? 'activated' : 'deactivated'}.`,
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
    // Get unique districts from both user data and college data
    const uniqueDistricts = React.useMemo(() => {
      const districts = new Set<string>();
      users.forEach(user => {
        // Prefer college district, fallback to user district
        const district = collegeIdToDistrict[user.college || user.collegeId || ''] || user.district;
        if (district && district.trim() !== '') {
          districts.add(district);
        }
      });
      return Array.from(districts).sort();
    }, [users, collegeIdToDistrict]);


    const sortedUsers = React.useMemo(() => {
        let sortableUsers = [...users];
        if (sortConfig !== null) {
            sortableUsers.sort((a, b) => {
                // Handle active field (boolean)
                if (sortConfig.key === 'active') {
                    const aActive = a.active ?? (a.status === 'Active');
                    const bActive = b.active ?? (b.status === 'Active');
                    if (aActive && !bActive) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (!aActive && bActive) return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                
                // Handle status field (legacy)
                if (sortConfig.key === 'status') {
                    const aStatus = a.status || (a.active ? 'Active' : 'Inactive');
                    const bStatus = b.status || (b.active ? 'Active' : 'Inactive');
                    if (aStatus === 'Active' && bStatus === 'Inactive') return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (aStatus === 'Inactive' && bStatus === 'Active') return sortConfig.direction === 'ascending' ? 1 : -1;
                }

                const aValue = a[sortConfig.key] ?? '';
                const bValue = b[sortConfig.key] ?? '';

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
            // Filter by college ID (collegeFilter stores college ID, not name)
            const matchesCollege = collegeFilter === 'all' || user.college === collegeFilter || user.collegeId === collegeFilter;
            // Filter by district - prefer college district, fallback to user district
            const userDistrict = collegeIdToDistrict[user.college || user.collegeId || ''] || user.district;
            const matchesDistrict = districtFilter === 'all' || userDistrict === districtFilter;
            
            return matchesSearch && matchesRole && matchesCollege && matchesDistrict;
        });
    }, [sortedUsers, searchTerm, roleFilter, collegeFilter, districtFilter]);
    
    // Reset selected users when filters change
    React.useEffect(() => {
        // Only keep selections that still exist in filtered results
        const validSelections = selectedUserIds.filter(id => 
            filteredUsers.some(user => user.id === id)
        );
        if (validSelections.length !== selectedUserIds.length) {
            setSelectedUserIds(validSelections);
        }
    }, [filteredUsers, selectedUserIds]);
    
    // Add back the handle select all function
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUserIds(filteredUsers.map(user => user.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleExport = () => {
        if (filteredUsers.length === 0) {
            toast({ title: "No Users to Export", description: "The current filter has no users to export.", variant: "destructive" });
            return;
        }

        const csvHeader = "ID,Name,Email,Phone,Status,Active,Profile Completed,Role,College,District,Designation,Pay Band,Employment Type\n";
        const csvRows = filteredUsers.map(user => {
            const isActive = user.active ?? (user.status === 'Active');
            const collegeName = collegeIdToName[user.college || user.collegeId || ''] || user.college || '';
            const district = collegeIdToDistrict[user.college || user.collegeId || ''] || user.district || '';
            const row = [
                user.id,
                `"${user.name}"`,
                user.email,
                user.phoneNumber || user.phone || '',
                user.status || (isActive ? 'Active' : 'Inactive'),
                isActive ? 'Yes' : 'No',
                user.profileCompleted ? 'Yes' : 'No',
                user.role,
                `"${collegeName}"`,
                `"${district}"`,
                `"${user.designation || ''}"`,
                `"${user.payBand || ''}"`,
                `"${user.employmentType || ''}"`
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
      <div className="flex items-center gap-2 cursor-pointer group hover:text-primary transition-colors duration-200" onClick={() => requestSort(column)}>
        {label}
        {isSorted ? (
          isAscending ? <ArrowUp className="h-4 w-4 text-primary" /> : <ArrowDown className="h-4 w-4 text-primary" />
        ) : (
          <ArrowUpDown className="h-4 w-4 text-muted-foreground group-hover:text-primary/60 transition-colors" />
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
      <SendNotificationModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} selectedUsers={selectedUsers} senderId={currentUser?.uid} />
      <Card className="card-premium rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
        <CardHeader className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-xl font-bold mb-1">User Management</CardTitle>
                    <CardDescription className="text-sm">
                        Manage your users and view their details.
                    </CardDescription>
                </div>
                <Button onClick={handleExport} className="btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users by name or email..."
                className="pl-10 w-full h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <div className="flex w-full sm:w-auto gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Role
                            <ChevronDown className="ml-auto h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem checked={roleFilter === 'all'} onCheckedChange={() => setRoleFilter('all')}>All Roles</DropdownMenuCheckboxItem>
                        {uniqueRoles.map(role => <DropdownMenuCheckboxItem key={role} checked={roleFilter === role} onCheckedChange={() => setRoleFilter(role)} className="capitalize">{role.toLowerCase()}</DropdownMenuCheckboxItem>)}
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
                    <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-lg">
                        <DropdownMenuCheckboxItem checked={collegeFilter === 'all'} onCheckedChange={() => setCollegeFilter('all')}>All Colleges</DropdownMenuCheckboxItem>
                        {colleges.map(college => <DropdownMenuCheckboxItem key={college.id} checked={collegeFilter === college.id} onCheckedChange={() => setCollegeFilter(college.id)}>{college.name}</DropdownMenuCheckboxItem>)}
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
                    <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem checked={districtFilter === 'all'} onCheckedChange={() => setDistrictFilter('all')}>All Districts</DropdownMenuCheckboxItem>
                         {uniqueDistricts.map(district => <DropdownMenuCheckboxItem key={district} checked={districtFilter === district} onCheckedChange={() => setDistrictFilter(district)} className="capitalize">{district}</DropdownMenuCheckboxItem>)}
                    </DropdownMenuContent>
                </DropdownMenu>
              <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)} disabled={selectedUserIds.length === 0} className="w-full sm:w-auto h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200 disabled:opacity-50">
                <Mail className="mr-2 h-4 w-4" />
                Send ({selectedUserIds.length})
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg">
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
                     <SortableHeader column="active" label="Status" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                     <SortableHeader column="profileCompleted" label="Profile" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="role" label="Role" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="college" label="College" />
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
                                      checked={user.active ?? (user.status === 'Active')}
                                      onCheckedChange={() => handleStatusToggle(user.id, user.active ?? (user.status === 'Active'))}
                                      aria-label="Toggle user status"
                                  />
                                  <Badge variant={(user.active ?? (user.status === 'Active')) ? 'default' : 'destructive'}>
                                      {user.active ?? (user.status === 'Active') ? 'Active' : 'Inactive'}
                                  </Badge>
                              </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                              <Badge variant={user.profileCompleted ? 'default' : 'secondary'}>
                                  {user.profileCompleted ? 'Complete' : 'Incomplete'}
                              </Badge>
                          </TableCell>
                           <TableCell className="hidden md:table-cell">
                              <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">{user.role.toLowerCase()}</Badge>
                           </TableCell>
                          <TableCell className="hidden md:table-cell">
                              {collegeIdToName[user.college || user.collegeId || ''] || user.college || '—'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                              {collegeIdToDistrict[user.college || user.collegeId || ''] || user.district || '—'}
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
                {filteredUsers.length === 0 ? 'No users found' : 
                 selectedUserIds.length > 0 ? `${selectedUserIds.length} of ${filteredUsers.length} row(s) selected` : 
                 `${filteredUsers.length} user(s) found`}
              </div>
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
