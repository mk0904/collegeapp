'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

export default function EnrollmentPage() {
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [filteredData, setFilteredData] = useState<EnrollmentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();

  const mockData: EnrollmentData[] = [
    {
      id: '1',
      collegeName: 'Test College',
      course: 'Education',
      stream: 'B.A',
      semester: '6th',
      role: 'principal',
      status: 'pending',
      categoryTotals: {
        general: 4,
        obc: 0,
        pwd: 0,
        sc: 1,
        st: 12
      },
      totals: {
        totalFemale: 4,
        totalMale: 13,
        totalStudents: 17
      },
      submittedAt: new Date(),
      submittedByName: 'Manish'
    }
  ];

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      setEnrollmentData(mockData);
      setFilteredData(mockData);
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
        item.semester.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedStatus, enrollmentData]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'obc':
        return 'bg-purple-100 text-purple-800';
      case 'sc':
        return 'bg-orange-100 text-orange-800';
      case 'st':
        return 'bg-green-100 text-green-800';
      case 'pwd':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enrollment Data</h1>
            <p className="text-muted-foreground">
              View and manage enrollment submissions
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading enrollment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enrollment Data</h1>
          <p className="text-muted-foreground">
            View and manage enrollment submissions from colleges
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentData.length}</div>
            <p className="text-xs text-muted-foreground">
              All enrollment submissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollmentData.filter(item => item.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollmentData.filter(item => item.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollmentData.reduce((sum, item) => sum + item.totals.totalStudents, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all submissions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by college, course, stream..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'No enrollment data found matching your filters.' 
                  : 'No enrollment data found.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.collegeName}</CardTitle>
                    <CardDescription>
                      {item.course} - {item.stream} ({item.semester} Semester)
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Total Students</h4>
                    <div className="text-2xl font-bold">{item.totals.totalStudents}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.totals.totalFemale} Female, {item.totals.totalMale} Male
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Category Breakdown</h4>
                    <div className="space-y-1">
                      {Object.entries(item.categoryTotals).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <Badge variant="outline" className={getCategoryColor(category)}>
                            {category.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Submission Info</h4>
                    <div className="text-sm space-y-1">
                      <div>Submitted by: {item.submittedByName}</div>
                      <div>Date: {formatDate(item.submittedAt)}</div>
                      <div>Role: {item.role}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                      {item.status === 'pending' && (
                        <Button size="sm" className="w-full">
                          Review Submission
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
