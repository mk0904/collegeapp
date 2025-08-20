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

export type School = {
  id: string;
  name: string;
  projectsCount: number;
  location: string;
  email: string;
  phone: string;
};

export type Project = {
    id: string;
    name: string;
    schoolId: string;
    schoolName: string;
    submissionsCount: number;
    status: 'Ongoing' | 'Completed' | 'Pending';
};

export type Submission = {
  id: string;
  userName: string;
  timestamp: string;
  status: 'Approved' | 'Rejected' | 'Pending';
};

export type Ticket = {
    id: string;
    userName: string;
    issueType: 'Technical' | 'Billing' | 'General';
    dateRaised: string;
    status: 'Open' | 'Pending' | 'Closed';
    subject: string;
};
