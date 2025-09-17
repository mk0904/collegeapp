'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, MapPin } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { generateAttendancePDF, groupAttendanceByUserAndMonth, type AttendanceRecord, type MonthlyAttendanceData } from '@/lib/pdf-generator'
import { useToast } from '@/hooks/use-toast'

interface MonthlyAttendanceTableProps {
  records: AttendanceRecord[]
  selectedMonth: string
  selectedYear: number
}

export function MonthlyAttendanceTable({ records, selectedMonth, selectedYear }: MonthlyAttendanceTableProps) {
  const { toast } = useToast()
  
  const groupedData = React.useMemo(() => {
    return groupAttendanceByUserAndMonth(records)
  }, [records])
  
  const currentMonthData = React.useMemo(() => {
    return Object.values(groupedData).filter(data => 
      data.month === selectedMonth && data.year === selectedYear
    )
  }, [groupedData, selectedMonth, selectedYear])
  
  const daysInMonth = new Date(selectedYear, getMonthNumber(selectedMonth), 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  const handleDownloadPDF = async (userData: MonthlyAttendanceData) => {
    try {
      console.log('Generating PDF for user:', userData)
      await generateAttendancePDF(userData)
      toast({
        title: "PDF Generated",
        description: `Attendance report for ${userData.userName} has been downloaded.`
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${(error as Error).message}`,
        variant: "destructive"
      })
    }
  }
  
  const handleLocationClick = (record: AttendanceRecord) => {
    if (record.latitude && record.longitude) {
      const url = `https://www.google.com/maps?q=${record.latitude},${record.longitude}`
      window.open(url, '_blank')
    }
  }
  
  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--'
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    } catch {
      return '--:--'
    }
  }
  
  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  const getDayName = (day: number) => {
    const date = new Date(selectedYear, getMonthNumber(selectedMonth) - 1, day)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  
  if (currentMonthData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No attendance data found for {selectedMonth} {selectedYear}
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {currentMonthData.map((userData) => (
        <Card key={userData.userId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{userData.userName}</CardTitle>
                <p className="text-sm text-muted-foreground">ID: {userData.userId}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Present: {userData.summary.present}</Badge>
                  <Badge variant="destructive">Absent: {userData.summary.absent}</Badge>
                  <Badge variant="secondary">Total Hours: {formatHours(userData.summary.totalWorkingHours)}</Badge>
                </div>
                <Button 
                  onClick={() => handleDownloadPDF(userData)}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Day</TableHead>
                    {days.map(day => (
                      <TableHead key={day} className="text-center min-w-12">
                        <div className="flex flex-col">
                          <span className="text-xs">{day}</span>
                          <span className="text-xs text-muted-foreground">{getDayName(day)}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Check-in times row */}
                  <TableRow>
                    <TableCell className="font-medium">IN</TableCell>
                    {days.map(day => {
                      const record = userData.dailyRecords[day.toString()]
                      return (
                        <TableCell key={day} className="text-center text-xs">
                          {record?.checkinTime ? formatTime(record.checkinTime) : '--:--'}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                  
                  {/* Check-out times row */}
                  <TableRow>
                    <TableCell className="font-medium">OUT</TableCell>
                    {days.map(day => {
                      const record = userData.dailyRecords[day.toString()]
                      return (
                        <TableCell key={day} className="text-center text-xs">
                          {record?.checkoutTime ? formatTime(record.checkoutTime) : '--:--'}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                  
                  {/* Working hours row */}
                  <TableRow>
                    <TableCell className="font-medium">WORK</TableCell>
                    {days.map(day => {
                      const record = userData.dailyRecords[day.toString()]
                      return (
                        <TableCell key={day} className="text-center text-xs">
                          {record ? formatHours(record.workingHours) : '00:00'}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                  
                  {/* Status row */}
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    {days.map(day => {
                      const record = userData.dailyRecords[day.toString()]
                      return (
                        <TableCell key={day} className="text-center">
                          <Badge 
                            variant={record ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {record ? 'P' : 'A'}
                          </Badge>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                  
                  {/* Location row */}
                  <TableRow>
                    <TableCell className="font-medium">Location</TableCell>
                    {days.map(day => {
                      const record = userData.dailyRecords[day.toString()]
                      return (
                        <TableCell key={day} className="text-center">
                          {record?.latitude && record?.longitude ? (
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
                      )
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  }
  return months[monthName] || 1
}
