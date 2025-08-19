'use client'

import * as React from 'react'
import {
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
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
import { mockUsers, User } from '@/lib/mock-data'
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
    const { toast } = useToast()
    const [users, setUsers] = React.useState<User[]>(mockUsers)

    const handleStatusToggle = (userId: string, currentStatus: 'Active' | 'Inactive') => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        toast({
            title: "User Status Updated",
            description: `User has been set to ${newStatus}.`,
        })
    }
  
  return (
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
            <Button size="sm" variant="outline">
              Send Circular
            </Button>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[40px]">
                    <Checkbox />
                </TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">
                    Phone
                </TableHead>
                <TableHead className="hidden md:table-cell">
                    Created on
                </TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <Checkbox />
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
                                <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>{user.status}</Badge>
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                        <TableCell className="hidden md:table-cell">
                            {user.phone}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            {user.createdOn}
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
                ))}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
        </div>
      </CardContent>
    </Card>
  )
}
