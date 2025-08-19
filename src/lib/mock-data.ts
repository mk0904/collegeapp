export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  role: 'Admin' | 'Teacher' | 'Student';
  createdOn: string;
  school: string;
};

export const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890', status: 'Active', role: 'Teacher', createdOn: '2023-01-15', school: 'Kohima Science College' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '234-567-8901', status: 'Active', role: 'Student', createdOn: '2023-02-20', school: 'St. Joseph\'s College' },
  { id: '3', name: 'Sam Wilson', email: 'sam.wilson@example.com', phone: '345-678-9012', status: 'Inactive', role: 'Student', createdOn: '2023-03-10', school: 'Model Christian College' },
  { id: '4', name: 'Alice Brown', email: 'alice.brown@example.com', phone: '456-789-0123', status: 'Active', role: 'Admin', createdOn: '2022-12-01', school: 'N/A' },
  { id: '5', name: 'Bob Johnson', email: 'bob.johnson@example.com', phone: '567-890-1234', status: 'Active', role: 'Teacher', createdOn: '2023-04-05', school: 'Kohima Science College' },
  { id: '6', name: 'Charlie Davis', email: 'charlie.davis@example.com', phone: '678-901-2345', status: 'Inactive', role: 'Student', createdOn: '2023-05-21', school: 'St. Joseph\'s College' },
];


export type School = {
  id: string;
  name: string;
  projectsCount: number;
  location: string;
};

export const mockSchools: School[] = [
    { id: 'sch1', name: 'Kohima Science College', projectsCount: 5, location: 'Kohima' },
    { id: 'sch2', name: 'St. Joseph\'s College', projectsCount: 3, location: 'Jakhama' },
    { id: 'sch3', name: 'Model Christian College', projectsCount: 8, location: 'Kohima' },
    { id: 'sch4', name: 'Dimapur Government College', projectsCount: 2, location: 'Dimapur' },
];

export type Project = {
    id: string;
    name: string;
    schoolId: string;
    schoolName: string;
    submissionsCount: number;
    status: 'Ongoing' | 'Completed' | 'Pending';
};

export const mockProjects: Project[] = [
    { id: 'proj1', name: 'Digital Literacy Campaign', schoolId: 'sch1', schoolName: 'Kohima Science College', submissionsCount: 25, status: 'Ongoing' },
    { id: 'proj2', name: 'Eco-Friendly Campus Initiative', schoolId: 'sch1', schoolName: 'Kohima Science College', submissionsCount: 15, status: 'Completed' },
    { id: 'proj3', name: 'Local History Archive', schoolId: 'sch2', schoolName: 'St. Joseph\'s College', submissionsCount: 10, status: 'Ongoing' },
    { id: 'proj4', name: 'Community Health Survey', schoolId: 'sch3', schoolName: 'Model Christian College', submissionsCount: 45, status: 'Ongoing' },
    { id: 'proj5', name: 'Waste Management System', schoolId: 'sch4', schoolName: 'Dimapur Government College', submissionsCount: 5, status: 'Pending' },
];

export type Submission = {
  id: string;
  userName: string;
  timestamp: string;
  status: 'Approved' | 'Rejected' | 'Pending';
};

export const mockSubmissions: Submission[] = [
    { id: 'sub1', userName: 'Jane Smith', timestamp: '2023-10-26 10:00 AM', status: 'Approved' },
    { id: 'sub2', userName: 'Sam Wilson', timestamp: '2023-10-26 11:30 AM', status: 'Pending' },
    { id: 'sub3', userName: 'Another Student', timestamp: '2023-10-27 09:00 AM', status: 'Rejected' },
];

export type Ticket = {
    id: string;
    userName: string;
    issueType: 'Technical' | 'Billing' | 'General';
    dateRaised: string;
    status: 'Open' | 'Pending' | 'Closed';
    subject: string;
};

export const mockTickets: Ticket[] = [
    { id: 'TKT-001', userName: 'John Doe', issueType: 'Technical', dateRaised: '2023-10-25', status: 'Open', subject: 'Cannot upload project files' },
    { id: 'TKT-002', userName: 'Jane Smith', issueType: 'General', dateRaised: '2023-10-24', status: 'Closed', subject: 'Query about project deadline' },
    { id: 'TKT-003', userName: 'Sam Wilson', issueType: 'Billing', dateRaised: '2023-10-26', status: 'Pending', subject: 'Invoice discrepancy' },
    { id: 'TKT-004', userName: 'Alice Brown', issueType: 'Technical', dateRaised: '2023-10-26', status: 'Open', subject: 'Login issues on Android app' },
];
