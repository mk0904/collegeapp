
'use client'

import {
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react'
import * as React from 'react'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Ticket } from '@/lib/mock-data'
import { getTickets } from '@/lib/firebase/firestore'
import { Skeleton } from '@/components/ui/skeleton'

export default function HelpdeskPage() {
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const fetchedTickets = await getTickets();
        setTickets(fetchedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
            <CardTitle>Helpdesk</CardTitle>
            <CardDescription>
                Manage user support tickets.
            </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Filter by Status <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem>Open</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Closed</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="hidden md:table-cell">User</TableHead>
              <TableHead className="hidden md:table-cell">Issue Type</TableHead>
              <TableHead className="hidden md:table-cell">Date Raised</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell className="hidden md:table-cell">{ticket.userName}</TableCell>
                  <TableCell className="hidden md:table-cell">{ticket.issueType}</TableCell>
                  <TableCell className="hidden md:table-cell">{ticket.dateRaised}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === 'Closed' ? 'secondary' : ticket.status === 'Open' ? 'destructive' : 'outline'}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Resolve</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
