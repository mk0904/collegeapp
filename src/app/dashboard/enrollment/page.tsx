'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Eye, Download, CheckCircle, XCircle, Clock, ChevronDown, Users, GraduationCap, Building2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getEnrollmentData, updateEnrollmentStatus } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryTotals {
  general: number;
  obc: number;
  pwd: number;
  sc: number;
  st: number;
}

interface Totals {
  totalFemale: number;
  totalMale: number;
  totalStudents: number;
}

interface EnrollmentData {
  id: string;
  collegeName: string;
  course: string;
  stream: string;
  semester: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  categoryTotals: CategoryTotals;
  totals: Totals;
  submittedAt: Date;
  submittedByName: string;
  studentData?: {
    [category: string]: {
      male?: string | number;
      female?: string | number;
    };
  };
}

export default function EnrollmentPage() {
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [filteredData, setFilteredData] = useState<EnrollmentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<EnrollmentData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      const data = await getEnrollmentData();
      setEnrollmentData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch enrollment data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentData();
  }, []);

  useEffect(() => {
    let filtered = enrollmentData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stream.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.submittedByName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedStatus, enrollmentData]);

  const handleStatusUpdate = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateEnrollmentStatus(id, newStatus);
      setEnrollmentData(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
      toast({
        title: 'Success',
        description: `Enrollment status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update enrollment status.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const stats = useMemo(() => {
    const total = enrollmentData.length;
    const pending = enrollmentData.filter(item => item.status === 'pending').length;
    const approved = enrollmentData.filter(item => item.status === 'approved').length;
    const rejected = enrollmentData.filter(item => item.status === 'rejected').length;
    const totalStudents = enrollmentData.reduce((sum, item) => sum + item.totals.totalStudents, 0);
    
    return { total, pending, approved, rejected, totalStudents };
  }, [enrollmentData]);

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-6 fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enrollment Data</h1>
          <p className="text-muted-foreground mt-1">View and manage enrollment submissions from colleges</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-premium rounded-2xl">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enrollment Data</h1>
        <p className="text-muted-foreground mt-1">View and manage enrollment submissions from colleges</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-premium rounded-2xl border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Submissions</CardTitle>
                <div className="text-3xl font-bold leading-tight tabular-nums bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mt-1">
                  {stats.total}
                </div>
              </div>
              <span className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                <FileText className="h-5 w-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              All submissions
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium rounded-2xl border-0 bg-gradient-to-br from-white to-yellow-50/30 shadow-lg">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pending Review</CardTitle>
                <div className="text-3xl font-bold leading-tight tabular-nums bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent mt-1">
                  {stats.pending}
                </div>
              </div>
              <span className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 p-3 rounded-2xl text-white shadow-lg shadow-yellow-500/30">
                <Clock className="h-5 w-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
              Awaiting approval
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium rounded-2xl border-0 bg-gradient-to-br from-white to-emerald-50/30 shadow-lg">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Approved</CardTitle>
                <div className="text-3xl font-bold leading-tight tabular-nums bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mt-1">
                  {stats.approved}
                </div>
              </div>
              <span className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-5 w-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Successfully approved
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium rounded-2xl border-0 bg-gradient-to-br from-white to-purple-50/30 shadow-lg">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Students</CardTitle>
                <div className="text-3xl font-bold leading-tight tabular-nums bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mt-1">
                  {stats.totalStudents}
                </div>
              </div>
              <span className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-3 rounded-2xl text-white shadow-lg shadow-purple-500/30">
                <Users className="h-5 w-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
              Across all submissions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="card-premium rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50">
        <CardHeader className="px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold mb-1">Enrollment Submissions</h2>
          <CardDescription className="text-sm">Manage and review enrollment data submissions</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by college, course, stream..."
                className="pl-10 w-full h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200">
                  Status <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-lg">
                <DropdownMenuItem onClick={() => setSelectedStatus('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('pending')}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('approved')}>Approved</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('rejected')}>Rejected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-xl border border-border/50 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-12 py-3">College</TableHead>
                  <TableHead className="h-12 py-3">Course</TableHead>
                  <TableHead className="h-12 py-3">Stream</TableHead>
                  <TableHead className="h-12 py-3">Semester</TableHead>
                  <TableHead className="h-12 py-3">Total Students</TableHead>
                  <TableHead className="h-12 py-3">Submitted By</TableHead>
                  <TableHead className="h-12 py-3">Date</TableHead>
                  <TableHead className="h-12 py-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      {searchTerm || selectedStatus !== 'all' 
                        ? 'No enrollment data found matching your filters.' 
                        : 'No enrollment data found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow 
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedItem(item);
                        setDetailOpen(true);
                      }}
                    >
                      <TableCell className="font-medium py-3">{item.collegeName}</TableCell>
                      <TableCell className="py-3">{item.course}</TableCell>
                      <TableCell className="py-3">{item.stream}</TableCell>
                      <TableCell className="py-3">{item.semester}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">{item.totals.totalStudents}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.totals.totalMale}M / {item.totals.totalFemale}F
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span>{item.submittedByName}</span>
                          <span className="text-xs text-muted-foreground capitalize">{item.role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">
                        {formatDate(item.submittedAt)}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge 
                          variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}
                          className="shadow-sm"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {/* Header banner */}
          <div className={`bg-gradient-to-r ${selectedItem?.status === 'approved' ? 'from-emerald-500 via-emerald-500/95 to-emerald-500/90' : selectedItem?.status === 'rejected' ? 'from-red-500 via-red-500/95 to-red-500/90' : 'from-primary via-primary/95 to-primary/90'} text-primary-foreground px-8 py-6`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{selectedItem?.collegeName}</h3>
                  <p className="text-sm opacity-90 mt-1">
                    {selectedItem?.course} - {selectedItem?.stream} ({selectedItem?.semester} Semester)
                  </p>
                </div>
              </div>
              <Badge 
                variant={selectedItem?.status === 'approved' ? 'default' : selectedItem?.status === 'rejected' ? 'destructive' : 'secondary'}
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
              >
                {selectedItem?.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1.5" />}
                {selectedItem?.status === 'rejected' && <XCircle className="h-3 w-3 mr-1.5" />}
                {selectedItem?.status === 'pending' && <Clock className="h-3 w-3 mr-1.5" />}
                {selectedItem?.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm/relaxed opacity-95">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                <Users className="h-4 w-4" />
                <span>{selectedItem?.totals.totalStudents} Total Students</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                <span>{selectedItem?.totals.totalMale} Male / {selectedItem?.totals.totalFemale} Female</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                <FileText className="h-4 w-4" />
                <span>by {selectedItem?.submittedByName} ({selectedItem?.role})</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 space-y-6 max-h-[70vh] overflow-y-auto">
            {selectedItem && (
              <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
                  <CardHeader className="pb-2 px-6 pt-6">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                      {selectedItem.totals.totalStudents}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                      <span>{selectedItem.totals.totalMale} Male</span>
                      <span>•</span>
                      <span>{selectedItem.totals.totalFemale} Female</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-purple-50/30 shadow-lg">
                  <CardHeader className="pb-2 px-6 pt-6">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Submission Date</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="text-sm font-medium">{formatDate(selectedItem.submittedAt)}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Submitted by {selectedItem.submittedByName}
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-emerald-50/30 shadow-lg">
                  <CardHeader className="pb-2 px-6 pt-6">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Role</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="text-sm font-medium capitalize">{selectedItem.role}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Submission authority
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="space-y-4">
                    {/* Main Categories */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Main Categories</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['general', 'obc', 'sc', 'st'].map((category) => {
                          const categoryData = selectedItem.studentData?.[category] || {};
                          const male = parseInt(categoryData.male?.toString() || '0') || 0;
                          const female = parseInt(categoryData.female?.toString() || '0') || 0;
                          const total = male + female;
                          const categoryTotal = selectedItem.categoryTotals[category] || 0;
                          
                          // Also include PWD subcategories
                          const pwdCategory = `${category}_pwd`;
                          const pwdData = selectedItem.studentData?.[pwdCategory] || {};
                          const pwdMale = parseInt(pwdData.male?.toString() || '0') || 0;
                          const pwdFemale = parseInt(pwdData.female?.toString() || '0') || 0;
                          const pwdTotal = pwdMale + pwdFemale;
                          
                          const finalMale = male + pwdMale;
                          const finalFemale = female + pwdFemale;
                          const finalTotal = finalMale + finalFemale;
                          
                          if (finalTotal === 0) return null;
                          
                          return (
                            <div key={category} className="card-premium rounded-lg border border-border/30 bg-gradient-to-br from-white to-slate-50/50 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold uppercase">{category}</span>
                                <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                  {categoryTotal}
                                </span>
                              </div>
                              <div className="space-y-1.5 mt-3 pt-3 border-t border-border/30">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Male</span>
                                  <span className="font-medium">{finalMale}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Female</span>
                                  <span className="font-medium">{finalFemale}</span>
                                </div>
                                {pwdTotal > 0 && (
                                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/20">
                                    <span className="text-muted-foreground italic">+ PWD</span>
                                    <span className="text-muted-foreground">{pwdMale}M / {pwdFemale}F</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* PWD Only Category */}
                    {selectedItem.studentData?.pwd_only && (() => {
                      const pwdData = selectedItem.studentData.pwd_only || {};
                      const male = parseInt(pwdData.male?.toString() || '0') || 0;
                      const female = parseInt(pwdData.female?.toString() || '0') || 0;
                      const total = male + female;
                      
                      if (total === 0) return null;
                      
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">PWD Categories</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="card-premium rounded-lg border border-border/30 bg-gradient-to-br from-white to-slate-50/50 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold uppercase">PWD Only</span>
                                <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                  {total}
                                </span>
                              </div>
                              <div className="space-y-1.5 mt-3 pt-3 border-t border-border/30">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Male</span>
                                  <span className="font-medium">{male}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Female</span>
                                  <span className="font-medium">{female}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {selectedItem.status === 'pending' && (
                <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200"
                    onClick={() => {
                      handleStatusUpdate(selectedItem.id, 'rejected');
                      setDetailOpen(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="h-10 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 transition-all duration-200"
                    onClick={() => {
                      handleStatusUpdate(selectedItem.id, 'approved');
                      setDetailOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
