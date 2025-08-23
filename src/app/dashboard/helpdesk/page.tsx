
'use client'

import {
  Check,
  Search,
  ChevronDown,
  Calendar as CalendarIcon,
} from 'lucide-react'
import * as React from 'react'
import { format } from "date-fns"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Ticket, User } from '@/lib/mock-data'
import { getTickets, getUsers, updateTicketStatus } from '@/lib/firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { TicketDetailsModal } from '@/components/ticket-details-modal'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | 'Open' | 'Pending' | 'Resolved';
type IssueTypeFilter = 'all' | 'Support' | 'Feedback';

export default function HelpdeskPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Filtering state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [userFilter, setUserFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [issueTypeFilter, setIssueTypeFilter] = React.useState<IssueTypeFilter>('all');
  const [dateRaised, setDateRaised] = React.useState<Date | undefined>(undefined);
  const [dateClosed, setDateClosed] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [fetchedTickets, fetchedUsers] = await Promise.all([getTickets(), getUsers()]);
        setTickets(fetchedTickets);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: "Error", description: "Failed to fetch helpdesk data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      await updateTicketStatus(ticketId, 'Resolved', currentDate);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Resolved', dateClosed: currentDate } : t));
      toast({ title: "Success", description: `Ticket ${ticketId} has been resolved.`});
    } catch(error) {
      console.error("Error resolving ticket:", error);
      toast({ title: "Error", description: "Failed to resolve the ticket.", variant: "destructive" });
    }
  };

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  }

  const filteredTickets = React.useMemo(() => {
    return tickets.filter(ticket => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm ? 
        ticket.subject.toLowerCase().includes(searchTermLower) ||
        ticket.userName.toLowerCase().includes(searchTermLower) ||
        ticket.id.toLowerCase().includes(searchTermLower)
        : true;
      
      const matchesUser = userFilter !== 'all' ? ticket.userName === userFilter : true;
      const matchesStatus = statusFilter !== 'all' ? ticket.status === statusFilter : true;
      const matchesIssueType = issueTypeFilter !== 'all' ? ticket.issueType === issueTypeFilter : true;

      const matchesDateRaised = dateRaised ? format(new Date(ticket.dateRaised), 'yyyy-MM-dd') === format(dateRaised, 'yyyy-MM-dd') : true;
      
      const matchesDateClosed = dateClosed && ticket.dateClosed ? format(new Date(ticket.dateClosed), 'yyyy-MM-dd') === format(dateClosed, 'yyyy-MM-dd') : !dateClosed;

      return matchesSearch && matchesUser && matchesStatus && matchesIssueType && matchesDateRaised && matchesDateClosed;
    });
  }, [tickets, searchTerm, userFilter, statusFilter, issueTypeFilter, dateRaised, dateClosed]);


  return (
    <>
      {selectedTicket && <TicketDetailsModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} ticket={selectedTicket} />}
      <Card>
        <CardHeader>
            <CardTitle>Helpdesk</CardTitle>
            <CardDescription>
                Manage user support tickets.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
              <div className="relative w-full sm:w-auto flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by subject, user, or ID..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      User <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem checked={userFilter === 'all'} onCheckedChange={() => setUserFilter('all')}>All Users</DropdownMenuCheckboxItem>
                    {users.map(user => (
                      <DropdownMenuCheckboxItem key={user.id} checked={userFilter === user.name} onCheckedChange={() => setUserFilter(user.name)}>
                        {user.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem checked={statusFilter === 'all'} onCheckedChange={() => setStatusFilter('all')}>All</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={statusFilter === 'Open'} onCheckedChange={() => setStatusFilter('Open')}>Open</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={statusFilter === 'Pending'} onCheckedChange={() => setStatusFilter('Pending')}>Pending</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={statusFilter === 'Resolved'} onCheckedChange={() => setStatusFilter('Resolved')}>Resolved</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Issue Type <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem checked={issueTypeFilter === 'all'} onCheckedChange={() => setIssueTypeFilter('all')}>All</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={issueTypeFilter === 'Support'} onCheckedChange={() => setIssueTypeFilter('Support')}>Support</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={issueTypeFilter === 'Feedback'} onCheckedChange={() => setIssueTypeFilter('Feedback')}>Feedback</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full sm:w-auto justify-start text-left font-normal", !dateRaised && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRaised ? format(dateRaised, "PPP") : <span>Date Raised</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dateRaised} onSelect={setDateRaised} initialFocus />
                    </PopoverContent>
                </Popover>

                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full sm:w-auto justify-start text-left font-normal", !dateClosed && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateClosed ? format(dateClosed, "PPP") : <span>Date Closed</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dateClosed} onSelect={setDateClosed} initialFocus />
                    </PopoverContent>
                </Popover>
              </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Date Raised</TableHead>
                  <TableHead>Date Closed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} onClick={() => handleRowClick(ticket)} className="cursor-pointer">
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{ticket.userName}</TableCell>
                      <TableCell>{ticket.issueType}</TableCell>
                      <TableCell>{ticket.dateRaised}</TableCell>
                      <TableCell>{ticket.dateClosed || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === 'Resolved' ? 'default' : ticket.status === 'Open' ? 'destructive' : 'secondary'}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {ticket.status !== 'Resolved' && (
                          <Button 
                            aria-haspopup="true" 
                            size="icon" 
                            variant="ghost" 
                            onClick={(e) => { e.stopPropagation(); handleResolveTicket(ticket.id); }}
                            title="Resolve Ticket"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Resolve Ticket</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
             {filteredTickets.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                No tickets found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
