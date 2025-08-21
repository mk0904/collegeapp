
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  role: 'Admin' | 'Teacher' | 'Student';
  createdOn: string;
  school: string;
  designation?: string;
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
    description: string;
};

export type Submission = {
  id: string;
  projectId: string;
  userName: string;
  timestamp: string;
  status: 'Approved' | 'Rejected' | 'Pending';
  title: string;
  description: string;
  images: string[];
};

export type Ticket = {
    id: string;
    userName: string;
    issueType: 'Technical' | 'Billing' | 'General';
    dateRaised: string;
    status: 'Open' | 'Pending' | 'Closed';
    subject: string;
};

// --- MOCK DATA ---

export const mockUsers: User[] = [
  { id: 'usr_1', name: 'T. N. Angami', email: 'tn.angami@example.com', phone: '+91 98765 43210', status: 'Active', role: 'Admin', createdOn: '2023-01-15', school: 'Kohima Science College' },
  { id: 'usr_2', name: 'P. Shilu Ao', email: 'shilu.ao@example.com', phone: '+91 98765 43211', status: 'Active', role: 'Teacher', createdOn: '2023-02-20', school: 'St. Joseph\'s College' },
  { id: 'usr_3', name: 'Hokishe Sema', email: 'hokishe.sema@example.com', phone: '+91 98765 43212', status: 'Inactive', role: 'Student', createdOn: '2023-03-10', school: 'Model Christian College' },
  { id: 'usr_4', name: 'S. C. Jamir', email: 'sc.jamir@example.com', phone: '+91 98765 43213', status: 'Active', role: 'Teacher', createdOn: '2023-04-05', school: 'Kohima Science College' },
  { id: 'usr_5', name: 'Neiphiu Rio', email: 'neiphiu.rio@example.com', phone: '+91 98765 43214', status: 'Active', role: 'Admin', createdOn: '2023-05-21', school: 'Nagaland University' },
];

export const mockSchools: School[] = [
    { id: 'sch_1', name: 'Kohima Science College', projectsCount: 2, location: 'Jotsoma, Kohima', email: 'contact@ksc.ac.in', phone: '0370-2231022' },
    { id: 'sch_2', name: 'St. Joseph\'s College', projectsCount: 1, location: 'Jakhama, Kohima', email: 'info@sjc.ac.in', phone: '0370-2232145'},
    { id: 'sch_3', name: 'Model Christian College', projectsCount: 3, location: 'Kohima', email: 'principal@mcc.ac.in', phone: '0370-2290344' },
    { id: 'sch_4', name: 'Nagaland University', projectsCount: 5, location: 'Lumami', email: 'registrar@nagalanduniversity.ac.in', phone: '0386-2245089' },
];

export const mockProjects: Project[] = [
    { id: 'proj_1', name: 'Annual Science Fair', schoolId: 'sch_1', schoolName: 'Kohima Science College', submissionsCount: 12, status: 'Ongoing', description: 'A showcase of innovative science projects from students across all departments, promoting scientific temper and research.' },
    { id: 'proj_2', name: 'Inter-College Debate Competition', schoolId: 'sch_2', schoolName: 'St. Joseph\'s College', submissionsCount: 8, status: 'Completed', description: 'An annual event fostering public speaking and critical thinking skills among students on contemporary topics.' },
    { id: 'proj_3', name: 'Tech Fest 2024', schoolId: 'sch_1', schoolName: 'Kohima Science College', submissionsCount: 25, status: 'Ongoing', description: 'A week-long festival with coding competitions, workshops, and tech talks by industry experts.' },
    { id: 'proj_4', name: 'Literary Fest', schoolId: 'sch_3', schoolName: 'Model Christian College', submissionsCount: 5, status: 'Pending', description: 'A celebration of literature, poetry, and storytelling, featuring guest authors and creative writing workshops.' },
    { id: 'proj_5', name: 'Research Symposium', schoolId: 'sch_4', schoolName: 'Nagaland University', submissionsCount: 30, status: 'Completed', description: 'A platform for postgraduate students and faculty to present their latest research findings to the academic community.' },
];

export const mockSubmissions: Submission[] = [
    { 
        id: 'sub_1', 
        projectId: 'proj_1', 
        userName: 'Hokishe Sema', 
        timestamp: '2024-05-10 10:00 AM', 
        status: 'Approved',
        title: 'Model of a Volcanic Eruption',
        description: 'A working model demonstrating the chemical reaction between baking soda and vinegar to simulate a volcanic eruption. The model is built using paper mache and painted to resemble a real volcano.',
        images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png', 'https://placehold.co/600x400.png']
    },
    { 
        id: 'sub_2', 
        projectId: 'proj_1', 
        userName: 'Vizol Angami', 
        timestamp: '2024-05-11 11:30 AM', 
        status: 'Pending',
        title: 'Renewable Energy Water Pump',
        description: 'A prototype of a water pump powered by a small solar panel. The project aims to provide a sustainable solution for irrigation in remote areas.',
        images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png']
    },
    { 
        id: 'sub_3', 
        projectId: 'proj_2', 
        userName: 'John Bosco Jasokie', 
        timestamp: '2024-04-20 02:15 PM', 
        status: 'Rejected',
        title: 'The future of AI in Nagaland',
        description: 'A presentation on the potential impact of Artificial Intelligence on the economy and society of Nagaland.',
        images: []
    },
    { 
        id: 'sub_4', 
        projectId: 'proj_2', 
        userName: 'K. L. Chishi', 
        timestamp: '2024-04-21 09:00 AM', 
        status: 'Approved',
        title: 'Traditional Naga Attire and its significance',
        description: 'A research paper and presentation on the cultural importance of traditional Naga clothing and ornaments.',
        images: ['https://placehold.co/600x400.png']
    },
];

export const mockTickets: Ticket[] = [
    { id: 'tkt_1', userName: 'T. N. Angami', issueType: 'Technical', dateRaised: '2024-05-20', status: 'Open', subject: 'Unable to login to portal' },
    { id: 'tkt_2', userName: 'P. Shilu Ao', issueType: 'General', dateRaised: '2024-05-19', status: 'Closed', subject: 'Question about project submission deadline' },
    { id: 'tkt_3', userName: 'Neiphiu Rio', issueType: 'Billing', dateRaised: '2024-05-21', status: 'Pending', subject: 'Invoice query' },
    { id: 'tkt_4', userName: 'S. C. Jamir', issueType: 'Technical', dateRaised: '2024-05-18', status: 'Open', subject: 'File upload failed' },
];
