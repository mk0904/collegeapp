
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  role: 'Admin' | 'Teacher' | 'Student';
  createdOn: string;
  school: string;
  district: string;
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

export type CloudinaryImage = {
    url: string;
    publicId: string;
    height: number;
    width: number;
    format: string;
    size: number;
}

export type Submission = {
  id: string;
  projectId: string;
  userName: string;
  timestamp: string;
  status: 'Approved' | 'Rejected' | 'Pending';
  title: string;
  description: string;
  images: CloudinaryImage[];
};

export type Ticket = {
    id: string;
    userName: string;
    userEmail: string;
    issueType: 'Support' | 'Feedback';
    dateRaised: string;
    dateClosed: string | null;
    status: 'Open' | 'Resolved';
    subject: string;
    description: string;
    image?: string;
};

// --- MOCK DATA ---

const placeholderImage = (publicId: string): CloudinaryImage => ({
    url: 'https://placehold.co/600x400.png',
    publicId,
    height: 400,
    width: 600,
    format: 'png',
    size: 10000
});

export const mockUsers: User[] = [
  { id: 'usr_1', name: 'T. N. Angami', email: 'tn.angami@example.com', phone: '+91 98765 43210', status: 'Active', role: 'Admin', createdOn: '2023-01-15', school: 'Kohima Science College', district: 'Kohima' },
  { id: 'usr_2', name: 'P. Shilu Ao', email: 'shilu.ao@example.com', phone: '+91 98765 43211', status: 'Active', role: 'Teacher', createdOn: '2023-02-20', school: 'St. Joseph\'s College', district: 'Kohima' },
  { id: 'usr_3', name: 'Hokishe Sema', email: 'hokishe.sema@example.com', phone: '+91 98765 43212', status: 'Inactive', role: 'Student', createdOn: '2023-03-10', school: 'Model Christian College', district: 'Kohima' },
  { id: 'usr_4', name: 'S. C. Jamir', email: 'sc.jamir@example.com', phone: '+91 98765 43213', status: 'Active', role: 'Teacher', createdOn: '2023-04-05', school: 'Kohima Science College', district: 'Kohima' },
  { id: 'usr_5', name: 'Neiphiu Rio', email: 'neiphiu.rio@example.com', phone: '+91 98765 43214', status: 'Active', role: 'Admin', createdOn: '2023-05-21', school: 'Nagaland University', district: 'Zunheboto' },
];

export const mockSchools: School[] = [
    { id: 'sch_1', name: 'Kohima Science College', projectsCount: 2, location: 'Jotsoma, Kohima', email: 'contact@ksc.ac.in', phone: '0370-2231022' },
    { id: 'sch_2', name: 'St. Joseph\'s College', projectsCount: 1, location: 'Jakhama, Kohima', email: 'info@sjc.ac.in', phone: '0370-2232145'},
    { id: 'sch_3', name: 'Model Christian College', projectsCount: 3, location: 'Kohima', email: 'principal@mcc.ac.in', phone: '0370-2290344' },
    { id: 'sch_4', name: 'Nagaland University', projectsCount: 5, location: 'Lumami', email: 'registrar@nagalanduniversity.ac.in', phone: '0386-2245089' },
];

export const mockProjects: Project[] = [
    { id: 'proj_1', name: 'Annual Science Fair', schoolId: 'sch_1', schoolName: 'Kohima Science College', submissionsCount: 0, status: 'Ongoing', description: 'A showcase of innovative science projects from students across all departments, promoting scientific temper and research.' },
    { id: 'proj_2', name: 'Inter-College Debate Competition', schoolId: 'sch_2', schoolName: 'St. Joseph\'s College', submissionsCount: 0, status: 'Completed', description: 'An annual event fostering public speaking and critical thinking skills among students on contemporary topics.' },
    { id: 'proj_3', name: 'Tech Fest 2024', schoolId: 'sch_1', schoolName: 'Kohima Science College', submissionsCount: 0, status: 'Ongoing', description: 'A week-long festival with coding competitions, workshops, and tech talks by industry experts.' },
    { id: 'proj_4', name: 'Literary Fest', schoolId: 'sch_3', schoolName: 'Model Christian College', submissionsCount: 0, status: 'Pending', description: 'A celebration of literature, poetry, and storytelling, featuring guest authors and creative writing workshops.' },
    { id: 'proj_5', name: 'Research Symposium', schoolId: 'sch_4', schoolName: 'Nagaland University', submissionsCount: 0, status: 'Completed', description: 'A platform for postgraduate students and faculty to present their latest research findings to the academic community.' },
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
        images: [placeholderImage('img1'), placeholderImage('img2'), placeholderImage('img3')]
    },
    {
        id: 'sub_2',
        projectId: 'proj_1',
        userName: 'Vizol Angami',
        timestamp: '2024-05-11 11:30 AM',
        status: 'Pending',
        title: 'Renewable Energy Water Pump',
        description: 'A prototype of a water pump powered by a small solar panel. The project aims to provide a sustainable solution for irrigation in remote areas.',
        images: [placeholderImage('img4'), placeholderImage('img5')]
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
        images: [placeholderImage('img6')]
    },
    {
        id: 'sub_5',
        projectId: 'proj_1',
        userName: 'S. C. Jamir',
        timestamp: '2024-05-12 03:00 PM',
        status: 'Pending',
        title: 'IoT Based Smart Home',
        description: 'A fully functional prototype of a smart home system using IoT devices to control lights, fans, and security cameras through a mobile application. The project uses a Raspberry Pi as the central hub.',
        images: [placeholderImage('img7'), placeholderImage('img8'), placeholderImage('img9'), placeholderImage('img10')]
    },
    {
      id: 'sub_6',
      projectId: 'proj_1',
      userName: 'T. N. Angami',
      timestamp: '2024-05-13 09:00 AM',
      status: 'Approved',
      title: 'Biodiversity of Nagaland',
      description: 'A detailed study of the rich biodiversity of Nagaland, with a focus on endemic species of flora and fauna. Includes photographs and samples collected during field trips.',
      images: [placeholderImage('img11'), placeholderImage('img12')],
    },
    {
        id: 'sub_7',
        projectId: 'proj_1',
        userName: 'Neiphiu Rio',
        timestamp: '2024-05-14 02:00 PM',
        status: 'Pending',
        title: 'AI in Agriculture',
        description: 'A presentation on how AI can be used to improve crop yields and detect diseases in plants, with a focus on local Naga crops.',
        images: [placeholderImage('img13'), placeholderImage('img14')]
    },
    {
        id: 'sub_8',
        projectId: 'proj_1',
        userName: 'Hokishe Sema',
        timestamp: '2024-05-15 11:00 AM',
        status: 'Pending',
        title: 'Water Quality Analysis of Local Rivers',
        description: 'A detailed analysis of water samples from three major rivers in the region, checking for pH levels, dissolved oxygen, and pollutants. The findings aim to raise awareness about water pollution.',
        images: [placeholderImage('img15')]
    }
];

export const mockTickets: Ticket[] = [
    { 
        id: 'TKT-0101', 
        userName: 'T. N. Angami', 
        userEmail: 'tn.angami@example.com',
        issueType: 'Support', 
        dateRaised: '2024-05-20', 
        dateClosed: null,
        status: 'Open', 
        subject: 'Unable to login to portal',
        description: 'I am unable to login to the portal since this morning. It keeps saying "Invalid Credentials" even though I am sure my password is correct. Please look into this matter urgently. I have tried resetting my password, but I did not receive any email.'
    },
    { 
        id: 'TKT-0102', 
        userName: 'P. Shilu Ao', 
        userEmail: 'shilu.ao@example.com',
        issueType: 'Feedback', 
        dateRaised: '2024-05-19', 
        dateClosed: '2024-05-20',
        status: 'Resolved', 
        subject: 'Question about project submission deadline',
        description: 'I had a question regarding the deadline for the upcoming science fair project. The portal says it is the 25th, but the notice board in college says it is the 28th. Can you please clarify which is the correct date? It would be great if the information was consistent.'
    },
    { 
        id: 'TKT-0103', 
        userName: 'Neiphiu Rio', 
        userEmail: 'neiphiu.rio@example.com',
        issueType: 'Support', 
        dateRaised: '2024-05-21', 
        dateClosed: null,
        status: 'Open', 
        subject: 'Invoice query',
        description: 'I have not yet received the invoice for the last quarter for the services. Can you please check and send it to my registered email address? I need it for accounting purposes.'
    },
    { 
        id: 'TKT-0104', 
        userName: 'S. C. Jamir', 
        userEmail: 'sc.jamir@example.com',
        issueType: 'Support', 
        dateRaised: '2024-05-18',
        dateClosed: null,
        status: 'Open', 
        subject: 'File upload failed',
        description: 'I am trying to upload the documents for my project submission, but the upload keeps failing with a generic "Upload Error". The file size is within the limit, and the format is correct. I have tried multiple times from different browsers.',
        image: 'https://placehold.co/600x400.png'
    },
];

    