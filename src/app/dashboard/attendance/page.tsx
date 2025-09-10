'use client'

import * as React from 'react'
import { Search, ArrowDown, ArrowUp, ArrowUpDown, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from '@/components/ui/skeleton'
import { getAttendanceRecords } from '@/lib/firebase/firestore'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock attendance data structure
interface AttendanceRecord {
  id: string;
  userName: string;
  userId: string;
  action: string;
  method: string;
  similarity: number | string;
  date: string; // e.g. 2025-09-10
  timestamp: string; // ISO string
  checkoutTime?: string; // ISO string
  time?: string; // derived pretty time for convenience
}

// Mock data for attendance records
const mockAttendanceData: AttendanceRecord[] = [
  {
    id: '1',
    studentName: 'John Doe',
    studentEmail: 'john.doe@example.com',
    college: 'Test College',
    district: 'Delhi',
    date: '2024-01-15',
    time: '09:00 AM',
    status: 'Present',
    subject: 'Mathematics',
    teacher: 'Dr. Smith'
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@example.com',
    college: 'Test College',
    district: 'Delhi',
    date: '2024-01-15',
    time: '09:15 AM',
    status: 'Late',
    subject: 'Mathematics',
    teacher: 'Dr. Smith'
  },
  {
    id: '3',
    studentName: 'Mike Johnson',
    studentEmail: 'mike.johnson@example.com',
    college: 'Test College',
    district: 'Delhi',
    date: '2024-01-15',
    time: '09:00 AM',
    status: 'Absent',
    subject: 'Mathematics',
    teacher: 'Dr. Smith'
  },
  {
    id: '4',
    studentName: 'Sarah Wilson',
    studentEmail: 'sarah.wilson@example.com',
    college: 'Test College',
    district: 'Delhi',
    date: '2024-01-15',
    time: '09:00 AM',
    status: 'Present',
    subject: 'Science',
    teacher: 'Dr. Brown'
  },
  {
    id: '5',
    studentName: 'David Lee',
    studentEmail: 'david.lee@example.com',
    college: 'Test College',
    district: 'Delhi',
    date: '2024-01-15',
    time: '09:00 AM',
    status: 'Present',
    subject: 'English',
    teacher: 'Ms. Davis'
  }
];

type SortableKeys = keyof AttendanceRecord;
type SortDirection = 'ascending' | 'descending';

export default function AttendancePage() {
    const { toast } = useToast()
    const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecord[]>([])
    const [loading, setLoading] = React.useState(true);
    const [selectedRecordIds, setSelectedRecordIds] = React.useState<string[]>([]);
    
    // Filtering
    const [searchTerm, setSearchTerm] = React.useState('');

    const [sortConfig, setSortConfig] = React.useState<{ key: SortableKeys; direction: SortDirection } | null>({ key: 'date', direction: 'descending'});

    const selectedRecords = attendanceRecords.filter(record => selectedRecordIds.includes(record.id));
    const [tab, setTab] = React.useState<'all' | 'today'>('all')

    React.useEffect(() => {
      (async () => {
        try {
          setLoading(true)
          const records = await getAttendanceRecords()
          // Map Firestore attendance to the displayed shape
          const mapped: AttendanceRecord[] = records.map((r: any, idx: number) => {
            const ts = typeof r.timestamp === 'string' ? r.timestamp : new Date().toISOString()
            const timePretty = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            return {
              id: r.id || String(idx),
              userName: r.userName || 'Unknown',
              userId: r.userId || 'unknown',
              action: r.action || '-',
              method: r.method || '-',
              similarity: typeof r.similarity === 'number' ? r.similarity : (r.similarity ?? ''),
              date: r.date || ts.slice(0, 10),
              timestamp: ts,
              checkoutTime: r.checkoutTime || undefined,
              time: timePretty,
            }
          })
          setAttendanceRecords(mapped)
        } finally {
          setLoading(false)
        }
      })()
    }, []);

    const handleSelectRecord = (recordId: string, checked: boolean) => {
        if (checked) {
            setSelectedRecordIds(prev => [...prev, recordId]);
        } else {
            setSelectedRecordIds(prev => prev.filter(id => id !== recordId));
        }
    }
    
    const requestSort = (key: SortableKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedRecords = React.useMemo(() => {
        let sortableRecords = [...attendanceRecords];
        if (sortConfig !== null) {
            sortableRecords.sort((a, b) => {
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
        return sortableRecords;
    }, [attendanceRecords, sortConfig]);
    
    const filteredRecords = React.useMemo(() => {
        return sortedRecords.filter(record => {
            const q = searchTerm.toLowerCase()
            return (
              record.userName.toLowerCase().includes(q) ||
              record.userId.toLowerCase().includes(q) ||
              record.action.toLowerCase().includes(q) ||
              record.method.toLowerCase().includes(q)
            )
        });
    }, [sortedRecords, searchTerm]);

    // Effective dataset for current tab
    const todayIso = React.useMemo(() => new Date().toISOString().slice(0,10), [])
    const tabRecords = React.useMemo(() => {
      if (tab === 'today') {
        return filteredRecords.filter(r => r.date === todayIso)
      }
      return filteredRecords
    }, [filteredRecords, tab, todayIso])
    
    // Reset selected records when filters change
    React.useEffect(() => {
        const validSelections = selectedRecordIds.filter(id => 
            filteredRecords.some(record => record.id === id)
        );
        if (validSelections.length !== selectedRecordIds.length) {
            setSelectedRecordIds(validSelections);
        }
    }, [filteredRecords, selectedRecordIds]);
    
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRecordIds(filteredRecords.map(record => record.id));
        } else {
            setSelectedRecordIds([]);
        }
    };

    const handleExport = () => {
        if (filteredRecords.length === 0) {
            toast({ title: "No Records to Export", description: "The current filter has no attendance records to export.", variant: "destructive" });
            return;
        }

        const csvHeader = "ID,Student Name,Student Email,College,District,Date,Time,Status,Subject,Teacher\n";
        const csvRows = filteredRecords.map(record => {
            const row = [
                record.id,
                `"${record.studentName}"`,
                record.studentEmail,
                `"${record.college}"`,
                `"${record.district}"`,
                record.date,
                record.time,
                record.status,
                `"${record.subject}"`,
                `"${record.teacher}"`
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
        link.setAttribute("download", `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Export successful", description: `${filteredRecords.length} attendance records have been exported.`});
    }

    const isAllSelected = selectedRecordIds.length === tabRecords.length && tabRecords.length > 0;
    const isIndeterminate = selectedRecordIds.length > 0 && selectedRecordIds.length < tabRecords.length;
  
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

  const getStatusBadgeVariant = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present': return 'default';
      case 'Late': return 'secondary';
      case 'Absent': return 'destructive';
      default: return 'outline';
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  return (
    <Card>
      <CardHeader>
          <div className="flex items-start justify-between">
              <div>
                  <CardDescription>
                      Manage attendance records and view detailed reports.
                  </CardDescription>
              </div>
              <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
              </Button>
          </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={tab} onValueChange={(v)=>setTab(v as 'all'|'today')} className="w-full mb-2">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, user ID, action, or method..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                     <SortableHeader column="userName" label="User" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="date" label="Date" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="time" label="Time" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="checkoutTime" label="Checkout" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="timestamp" label="Timestamp" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="userId" label="User ID" />
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
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-36" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    tabRecords.map(record => (
                      <TableRow key={record.id} data-state={selectedRecordIds.includes(record.id) ? 'selected' : ''}>
                          <TableCell>
                              <Checkbox 
                                checked={selectedRecordIds.includes(record.id)}
                                onCheckedChange={(checked) => handleSelectRecord(record.id, !!checked)}
                                aria-label={`Select row for ${record.userName}`}
                              />
                          </TableCell>
                          <TableCell className="font-medium">
                              <div>{record.userName}</div>
                              <div className="text-sm text-muted-foreground">{record.userId}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(record.date)}</TableCell>
                          <TableCell className="hidden md:table-cell">{record.time}</TableCell>
                          <TableCell className="hidden md:table-cell">{record.checkoutTime ? new Date(record.checkoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                          <TableCell className="hidden md:table-cell">{new Date(record.timestamp).toLocaleString()}</TableCell>
                          <TableCell className="hidden md:table-cell">{record.userId}</TableCell>
                      </TableRow>
                    ))
                  )}
              </TableBody>
              </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {tabRecords.length === 0 ? 'No attendance records found' : 
                 selectedRecordIds.length > 0 ? `${selectedRecordIds.length} of ${tabRecords.length} row(s) selected` : 
                 `${tabRecords.length} attendance record(s) found`}
              </div>
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
  )
}
