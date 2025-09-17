import jsPDF from 'jspdf'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface AttendanceRecord {
  id: string;
  userName: string;
  userId: string;
  date: string;
  checkinTime?: string;
  checkoutTime?: string;
  workingHours: number;
  latitude?: number;
  longitude?: number;
  method: string;
  similarity: number | string;
}

export interface MonthlyAttendanceData {
  userName: string;
  userId: string;
  month: string;
  year: number;
  dailyRecords: { [day: string]: AttendanceRecord | null };
  summary: {
    present: number;
    absent: number;
    totalWorkingHours: number;
    totalOvertime: number;
  };
}

export async function generateAttendancePDF(data: MonthlyAttendanceData): Promise<void> {
  try {
    console.log('Starting PDF generation with data:', data)
    
    // Dynamically import autoTable
    const { default: autoTable } = await import('jspdf-autotable')
    console.log('autoTable imported successfully:', typeof autoTable)
    
    const doc = new jsPDF('landscape', 'mm', 'a4')
    console.log('jsPDF instance created successfully')
    
    // Set font
    doc.setFont('helvetica')
    console.log('Font set successfully')
    
    // Header
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('ATTENDANCE REPORT', 20, 20)
    
    // Employee details
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Employee Name: ${data.userName || 'Unknown'}`, 20, 35)
    doc.text(`Employee ID: ${data.userId || 'Unknown'}`, 20, 45)
    doc.text(`Report Month: ${data.month || 'Unknown'}-${data.year || new Date().getFullYear()}`, 20, 55)
    
    // Summary
    doc.text(`Present Days: ${data.summary?.present || 0}`, 20, 70)
    doc.text(`Absent Days: ${data.summary?.absent || 0}`, 20, 80)
    doc.text(`Total Working Hours: ${formatHours(data.summary?.totalWorkingHours || 0)}`, 20, 90)
  
    // Prepare table data
    const days = Array.from({ length: 31 }, (_, i) => i + 1)
    const tableData: any[] = []
    
    // Day numbers row
    const dayRow = ['Day', ...days.map(d => d.toString())]
    tableData.push(dayRow)
    
    // Day names row
    const dayNames = days.map(day => {
      const date = new Date(data.year, getMonthNumber(data.month) - 1, day)
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    })
    const dayNameRow = ['Day', ...dayNames]
    tableData.push(dayNameRow)
    
    // Check-in times row
    const checkinRow = ['IN', ...days.map(day => {
      const record = data.dailyRecords[day.toString()]
      return record?.checkinTime ? formatTime(record.checkinTime) : '--:--'
    })]
    tableData.push(checkinRow)
    
    // Check-out times row
    const checkoutRow = ['OUT', ...days.map(day => {
      const record = data.dailyRecords[day.toString()]
      return record?.checkoutTime ? formatTime(record.checkoutTime) : '--:--'
    })]
    tableData.push(checkoutRow)
    
    // Working hours row
    const workRow = ['WORK', ...days.map(day => {
      const record = data.dailyRecords[day.toString()]
      return record ? formatHours(record.workingHours) : '00:00'
    })]
    tableData.push(workRow)
    
    // Status row
    const statusRow = ['Status', ...days.map(day => {
      const record = data.dailyRecords[day.toString()]
      return record ? 'P' : 'A'
    })]
    tableData.push(statusRow)
    
    // Generate table
    console.log('Generating table with data:', tableData)
    console.log('autoTable function available:', typeof autoTable)
    
    if (typeof autoTable === 'function') {
      autoTable(doc, {
        startY: 110,
        head: [['', ...days.map(d => d.toString())]],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 1,
        },
        columnStyles: {
          0: { cellWidth: 15 },
        },
        margin: { left: 20, right: 20 },
      })
      console.log('Table generated successfully')
    } else {
      console.warn('autoTable not available, creating simple table')
      // Fallback: create a simple table without autoTable
      createSimpleTable(doc, tableData, days, 110)
    }
    
    // Save the PDF
    const fileName = `attendance_${(data.userName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_')}_${data.month || 'Unknown'}_${data.year || new Date().getFullYear()}.pdf`
    doc.save(fileName)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF: ' + (error as Error).message)
  }
}

export async function generateAttendancePDFBlob(data: MonthlyAttendanceData): Promise<Blob> {
  // Same as generateAttendancePDF but returns Blob instead of saving
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF('landscape', 'mm', 'a4')

  renderUserSection(doc, data, autoTable)

  const blob = doc.output('blob') as Blob
  return blob
}

export async function generateCombinedAttendancePDFBlob(datas: MonthlyAttendanceData[]): Promise<Blob> {
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF('landscape', 'mm', 'a4')

  // Pack sections tightly top-to-bottom; add a new page only when needed
  const pageHeight = (doc as any).internal.pageSize.getHeight()
  let cursorY = 12
  for (let i = 0; i < datas.length; i++) {
    const endY = renderUserSection(doc, datas[i], autoTable, cursorY)
    cursorY = endY + 6 // small gap between sections
    if (i < datas.length - 1 && cursorY > pageHeight - 20) {
      doc.addPage('a4', 'landscape')
      cursorY = 12
    }
  }

  return doc.output('blob') as Blob
}

function renderUserSection(doc: jsPDF, data: MonthlyAttendanceData, autoTable: any, startY: number = 16): number {
  // Build a SINGLE table that contains:
  // - Title
  // - Info rows (Employee Name/ID/Month)
  // - Summary rows (Present/Absent/Total hours)
  // - Daily matrix (Day numbers, Day names, IN/OUT/WORK/Status)

  // Build day columns based on real month length
  const monthNum = getMonthNumber(data.month)
  const daysInMonth = new Date(data.year, monthNum, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const totalCols = 1 + days.length // first column for labels + day columns

  // Helper to produce an empty filler spanning remaining columns
  const spanRest = (used: number) => totalCols - used

  const allRows: any[] = []

  // Title row
  allRows.push([
    { content: 'ATTENDANCE REPORT', colSpan: totalCols, styles: { halign: 'left', fontStyle: 'bold', fontSize: 11 } }
  ])

  // Compact info in single row (2 cells: Name, Report Month)
  const half = Math.floor((totalCols - 1) / 2)
  const rem = (totalCols - 1) - half * 2
  allRows.push([
    { content: 'Employee Name: ' + (data.userName || 'Unknown'), colSpan: half + 1, styles: { fontStyle: 'bold' } },
    { content: 'Report Month: ' + `${data.month || 'Unknown'}-${data.year || new Date().getFullYear()}`, colSpan: half + rem }
  ])

  // Summary section header
  allRows.push([
    { content: 'Present Days', colSpan: 10, styles: { fillColor: [240, 248, 255], fontStyle: 'bold' } },
    { content: 'Absent Days', colSpan: 10, styles: { fillColor: [240, 248, 255], fontStyle: 'bold' } },
    { content: 'Total Working Hours', colSpan: totalCols - 20, styles: { fillColor: [240, 248, 255], fontStyle: 'bold' } }
  ])
  allRows.push([
    { content: String(data.summary?.present || 0), colSpan: 10 },
    { content: String(data.summary?.absent || 0), colSpan: 10 },
    { content: formatHours(data.summary?.totalWorkingHours || 0), colSpan: totalCols - 20 }
  ])

  // Daily matrix header rows
  allRows.push([{ content: '', styles: { fillColor: [33, 150, 243], textColor: 255 } }, ...days.map(d => ({ content: String(d), styles: { fillColor: [33, 150, 243], textColor: 255 } }))])
  const dayNames = days.map(day => {
    const date = new Date(data.year, monthNum - 1, day)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  })
  allRows.push([{ content: 'Day' }, ...dayNames])

  // IN/OUT/WORK/Status rows
  allRows.push([{ content: 'IN', styles: { fontStyle: 'bold' } }, ...days.map(d => data.dailyRecords[d.toString()]?.checkinTime ? formatTime(data.dailyRecords[d.toString()]!.checkinTime!) : '--:--')])
  allRows.push([{ content: 'OUT', styles: { fontStyle: 'bold' } }, ...days.map(d => data.dailyRecords[d.toString()]?.checkoutTime ? formatTime(data.dailyRecords[d.toString()]!.checkoutTime!) : '--:--')])
  allRows.push([{ content: 'WORK', styles: { fontStyle: 'bold' } }, ...days.map(d => data.dailyRecords[d.toString()] ? formatHours(data.dailyRecords[d.toString()]!.workingHours) : '00:00')])
  allRows.push([{ content: 'Status', styles: { fontStyle: 'bold' } }, ...days.map(d => data.dailyRecords[d.toString()] ? 'P' : 'A')])

  if (typeof autoTable === 'function') {
    autoTable(doc, {
      startY: startY,
      body: allRows,
      styles: { fontSize: 7, cellPadding: 0.6 },
      margin: { left: 20, right: 20 },
      columnStyles: { 0: { cellWidth: 25 } },
      pageBreak: 'auto',
      didParseCell: (dataCtx: any) => {
        // Color encodings
        const r = dataCtx.row.index
        const c = dataCtx.column.index
        const cell = dataCtx.cell
        // Title row
        if (r === 0) {
          cell.styles.fillColor = [33, 150, 243]
          cell.styles.textColor = 255
          cell.styles.fontStyle = 'bold'
          cell.styles.fontSize = 13
        }
        // Summary header row (after title + 1 info row => row 2)
        if (r === 2) {
          cell.styles.fillColor = [224, 242, 254]
          cell.styles.fontStyle = 'bold'
        }
        // IN/OUT/WORK/Status banding near the bottom: find their starting index
        // Rows layout: 0 title, 1 infoRow, 2 summary header, 3 summary values,
        // 4 matrix header nums, 5 day names, 6 IN, 7 OUT, 8 WORK, 9 Status
        if (r === 6) cell.styles.fillColor = [232, 245, 233] // IN light green
        if (r === 7) cell.styles.fillColor = [255, 243, 224] // OUT light orange
        if (r === 8) cell.styles.fillColor = [237, 242, 247] // WORK light blue-gray
        if (r === 9 && c > 0) {
          // Status badges
          const v = String(cell.raw || '').trim().toUpperCase()
          if (v === 'P') {
            cell.styles.fillColor = [220, 255, 220]
            cell.styles.textColor = [0, 120, 0]
            cell.styles.fontStyle = 'bold'
          } else if (v === 'A') {
            cell.styles.fillColor = [255, 224, 224]
            cell.styles.textColor = [160, 0, 0]
            cell.styles.fontStyle = 'bold'
          }
        }
        // Matrix header (row 4) blue
        if (r === 4) {
          cell.styles.fillColor = [33, 150, 243]
          cell.styles.textColor = 255
          cell.styles.fontStyle = 'bold'
        }
      }
    })
  } else {
    // Fallback minimal rendering when autotable unavailable
    createSimpleTable(doc, [['Unsupported in simple mode']], days, startY + 20)
  }
  const finalY = ((doc as any).lastAutoTable?.finalY || startY + 120)
  return finalY
}

function createSimpleTable(doc: jsPDF, tableData: any[], days: number[], startY: number) {
  const cellWidth = 8
  const cellHeight = 6
  let currentY = startY
  
  // Draw table headers
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  
  // Draw day numbers
  doc.text('Day', 20, currentY)
  days.forEach((day, index) => {
    doc.text(day.toString(), 35 + (index * cellWidth), currentY)
  })
  currentY += cellHeight
  
  // Draw table rows
  doc.setFont('helvetica', 'normal')
  tableData.forEach((row, rowIndex) => {
    if (rowIndex === 0) return // Skip day numbers row as it's already drawn
    
    doc.text(row[0], 20, currentY)
    row.slice(1).forEach((cell: string, cellIndex: number) => {
      doc.text(cell, 35 + (cellIndex * cellWidth), currentY)
    })
    currentY += cellHeight
  })
}

function formatTime(timeString: string): string {
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

function formatHours(hours: number): string {
  // Handle very small decimal values (likely in hours already)
  if (hours < 1) {
    const totalMinutes = Math.round(hours * 60)
    const wholeHours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${wholeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  }
  return months[monthName] || 1
}

export function groupAttendanceByUserAndMonth(records: AttendanceRecord[]): { [userId: string]: MonthlyAttendanceData } {
  const grouped: { [userId: string]: MonthlyAttendanceData } = {}
  
  records.forEach(record => {
    try {
      const date = new Date(record.date)
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', record.date)
        return
      }
      
      const month = date.toLocaleDateString('en-US', { month: 'long' })
      const year = date.getFullYear()
      const day = date.getDate()
      
      if (!grouped[record.userId]) {
        grouped[record.userId] = {
          userName: record.userName || 'Unknown',
          userId: record.userId || 'unknown',
          month,
          year,
          dailyRecords: {},
          summary: {
            present: 0,
            absent: 0,
            totalWorkingHours: 0,
            totalOvertime: 0
          }
        }
      }
      
      const userData = grouped[record.userId]
      userData.dailyRecords[day.toString()] = record
      userData.summary.present++
      userData.summary.totalWorkingHours += (record.workingHours || 0)
    } catch (error) {
      console.warn('Error processing record:', record, error)
    }
  })
  
  // Calculate absent days
  Object.values(grouped).forEach(userData => {
    try {
      const daysInMonth = new Date(userData.year, getMonthNumber(userData.month), 0).getDate()
      userData.summary.absent = Math.max(0, daysInMonth - userData.summary.present)
    } catch (error) {
      console.warn('Error calculating absent days for user:', userData.userId, error)
      userData.summary.absent = 0
    }
  })
  
  return grouped
}
