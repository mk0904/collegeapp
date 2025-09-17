'use client'

import * as React from 'react'
import { Search, ArrowDown, ArrowUp, ArrowUpDown, Download, Calendar, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from '@/components/ui/skeleton'
import { getAttendanceRecords } from '@/lib/firebase/firestore'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MonthlyAttendanceTable } from '@/components/monthly-attendance-table'
import { type AttendanceRecord, groupAttendanceByUserAndMonth, generateAttendancePDFBlob, generateCombinedAttendancePDFBlob } from '@/lib/pdf-generator'

// Updated attendance data structure
interface AttendanceRecordLocal {
  id: string;
  userName: string;
  userId: string;
  college?: string;
  date: string; // e.g. 2025-09-10
  timestamp: string; // ISO string
  checkinTime?: string; // ISO string
  checkoutTime?: string; // ISO string
  workingHours: number;
  latitude?: number;
  longitude?: number;
  method: string;
  similarity: number | string;
  time?: string; // derived pretty time for convenience
}


type SortableKeys = keyof AttendanceRecordLocal;
type SortDirection = 'ascending' | 'descending';

export default function AttendancePage() {
    const { toast } = useToast()
    const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecordLocal[]>([])
    const [loading, setLoading] = React.useState(true);
    const [selectedRecordIds, setSelectedRecordIds] = React.useState<string[]>([]);
    
    // Filtering
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedMonth, setSelectedMonth] = React.useState(new Date().toLocaleDateString('en-US', { month: 'long' }));
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [selectedCollege, setSelectedCollege] = React.useState<string>('all');
    // Replace date range with month/year filter + Today quick filter
    const currentMonthName = React.useMemo(() => new Date().toLocaleDateString('en-US', { month: 'long' }), [])
    const currentYearStr = React.useMemo(() => String(new Date().getFullYear()), [])
    const [filterMonth, setFilterMonth] = React.useState<string>(currentMonthName);
    const [filterYear, setFilterYear] = React.useState<string>(currentYearStr);
    const [todayOnly, setTodayOnly] = React.useState<boolean>(false);

    const [sortConfig, setSortConfig] = React.useState<{ key: SortableKeys; direction: SortDirection } | null>({ key: 'date', direction: 'descending'});

    const selectedRecords = attendanceRecords.filter(record => selectedRecordIds.includes(record.id));
    const [tab, setTab] = React.useState<'all' | 'monthly'>('all')

    React.useEffect(() => {
      (async () => {
        try {
          setLoading(true)
          const records = await getAttendanceRecords()
          // Map Firestore attendance to the displayed shape
          const mapped: AttendanceRecordLocal[] = records.map((r: any, idx: number) => {
            const ts = typeof r.timestamp === 'string' ? r.timestamp : new Date().toISOString()
            const timePretty = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            return {
              id: r.id || String(idx),
              userName: r.userName || 'Unknown',
              userId: r.userId || 'unknown',
              college: r.college || r.collegeName || r.college_name || '',
              method: r.method || '-',
              similarity: typeof r.similarity === 'number' ? r.similarity : (r.similarity ?? ''),
              date: r.date || ts.slice(0, 10),
              timestamp: ts,
              checkinTime: r.checkinTime || undefined,
              checkoutTime: r.checkoutTime || undefined,
              workingHours: r.workingHours || 0,
              latitude: r.latitude || undefined,
              longitude: r.longitude || undefined,
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
            const matchesText = (
              record.userName.toLowerCase().includes(q) ||
              record.userId.toLowerCase().includes(q) ||
              (record.college || '').toLowerCase().includes(q) ||
              record.method.toLowerCase().includes(q)
            )

            const matchesCollege = selectedCollege === 'all' || (record.college || '') === selectedCollege
            // Method filter removed

            const withinDateFilter = (() => {
              if (todayOnly) return record.date === new Date().toISOString().slice(0,10)
              if (filterMonth === 'all' && filterYear === 'all') return true
              const d = new Date(record.date)
              const m = d.toLocaleDateString('en-US', { month: 'long' })
              const y = String(d.getFullYear())
              if (filterMonth !== 'all' && m !== filterMonth) return false
              if (filterYear !== 'all' && y !== filterYear) return false
              return true
            })()

            return matchesText && matchesCollege && withinDateFilter
        });
    }, [sortedRecords, searchTerm, selectedCollege, filterMonth, filterYear, todayOnly]);

    // Effective dataset for current tab
    const todayIso = React.useMemo(() => new Date().toISOString().slice(0,10), [])
    const todaysCount = React.useMemo(() => attendanceRecords.filter(r => r.date === todayIso).length, [attendanceRecords, todayIso])
    const tabRecords = React.useMemo(() => filteredRecords, [filteredRecords])
    
    // Convert records for monthly view
    const monthlyRecords: AttendanceRecord[] = React.useMemo(() => {
      return attendanceRecords.map(record => ({
        id: record.id,
        userName: record.userName,
        userId: record.userId,
        date: record.date,
        checkinTime: record.checkinTime,
        checkoutTime: record.checkoutTime,
        workingHours: record.workingHours,
        latitude: record.latitude,
        longitude: record.longitude,
        method: record.method,
        similarity: record.similarity,
      }))
    }, [attendanceRecords])
    
    // Ensure default selection: select all rows in the current filtered view
    React.useEffect(() => {
        const allIds = filteredRecords.map(r => r.id)
        setSelectedRecordIds(allIds)
    }, [filteredRecords])
    
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRecordIds(filteredRecords.map(record => record.id));
        } else {
            setSelectedRecordIds([]);
        }
    };

    const handleExport = async () => {
        if (filteredRecords.length === 0) {
            toast({ title: "No Records to Export", description: "The current filter has no attendance records to export.", variant: "destructive" });
            return;
        }

        // Build monthly data per user for current month selection
        // Limit export to selected rows only
        const selectedRowRecords = filteredRecords.filter(r => selectedRecordIds.includes(r.id))
        if (selectedRowRecords.length === 0) {
          toast({ title: 'Nothing selected', description: 'Select at least one row to export.' })
          return
        }

        const recordsForMonth: AttendanceRecord[] = attendanceRecords.map(record => ({
          id: record.id,
          userName: record.userName,
          userId: record.userId,
          date: record.date,
          checkinTime: record.checkinTime,
          checkoutTime: record.checkoutTime,
          workingHours: record.workingHours,
          latitude: record.latitude,
          longitude: record.longitude,
          method: record.method,
          similarity: record.similarity,
        }))
        const grouped = groupAttendanceByUserAndMonth(recordsForMonth)

        const monthName = new Date().toLocaleDateString('en-US', { month: 'long' })
        const yearVal = new Date().getFullYear()

        // Build combined PDF for only filtered users
        const userIds = Array.from(new Set(selectedRowRecords.map(r => r.userId)))
        const pages = userIds
          .map(uid => grouped[uid])
          .filter(Boolean)
        if (pages.length === 0) {
          toast({ title: 'No data', description: 'No matching user pages to export.' })
          return
        }

        const combinedBlob = await generateCombinedAttendancePDFBlob(pages as any)
        const link = document.createElement('a')
        link.href = URL.createObjectURL(combinedBlob)
        link.download = `attendance_combined_${new Date().toISOString().slice(0,10)}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast({ title: 'Export successful', description: `Downloaded 1 combined PDF for ${pages.length} user(s).` })
    }
    
    const handleLocationClick = (record: AttendanceRecordLocal) => {
        if (record.latitude && record.longitude) {
            const url = `https://www.google.com/maps?q=${record.latitude},${record.longitude}`
            window.open(url, '_blank')
        } else {
            toast({
                title: "No Location Data",
                description: "Location coordinates are not available for this record.",
                variant: "destructive"
            })
        }
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


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  return (
    <Card>
        <CardHeader>
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <CardDescription>
                        Manage attendance records and view detailed reports.
                    </CardDescription>
                    <div className="inline-flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Today</span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{todaysCount}</span>
                    </div>
                </div>
                <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={tab} onValueChange={(v)=>setTab(v as 'all'|'monthly')} className="w-full mb-2">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === 'monthly' ? (
          <div className="flex flex-col sm:flex-wrap sm:flex-row items-center gap-2 mb-4">
            <div className="relative flex-1 w-full min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or college..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="College" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {Array.from(new Set(attendanceRecords.map(r => r.college).filter(Boolean) as string[])).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 3 + i)).map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant={todayOnly ? 'default' : 'outline'} size="sm" onClick={()=>setTodayOnly(prev=>!prev)}>
              Today
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-wrap sm:flex-row items-center gap-2 mb-4">
            <div className="relative flex-1 w-full min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, user ID, or method..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="College" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {Array.from(new Set(attendanceRecords.map(r => r.college).filter(Boolean) as string[])).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Month filter */}
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Year filter */}
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 3 + i)).map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant={todayOnly ? 'default' : 'outline'} size="sm" onClick={()=>setTodayOnly(prev=>!prev)}>
              Today
            </Button>
          </div>
        )}
        {tab === 'monthly' ? (
          <MonthlyAttendanceTable 
            records={monthlyRecords}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        ) : (
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
                  <TableHead className="hidden lg:table-cell">College</TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="checkinTime" label="Check-in" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="checkoutTime" label="Check-out" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      <SortableHeader column="workingHours" label="Working Hours" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                      Location
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
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-8" /></TableCell>
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
                          <TableCell className="font-medium">{record.userName}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(record.date)}</TableCell>
                          <TableCell className="hidden lg:table-cell">{record.college || '-'}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {record.checkinTime ? new Date(record.checkinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {record.checkoutTime ? new Date(record.checkoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatHours(record.workingHours)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {record.latitude && record.longitude ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLocationClick(record)}
                                className="h-6 w-6 p-0"
                              >
                                <MapPin className="h-3 w-3" />
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">--</span>
                            )}
                          </TableCell>
                      </TableRow>
                    ))
                  )}
              </TableBody>
              </Table>
          </div>
        )}
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
