
import { collection, doc, getDoc, getDocs, getFirestore, query, where, updateDoc, limit as queryLimit, addDoc, runTransaction, setDoc } from 'firebase/firestore';
import { app } from '../firebase';
import type { User, College, Project, Submission, Ticket, Notification } from '../mock-data';
import { mockUsers, mockColleges, mockProjects, mockSubmissions, mockTickets } from '../mock-data';

const db = getFirestore(app);

// Users
export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  if (userSnapshot.docs.length > 0) {
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
  }
  return mockUsers;
}

export async function getUserById(userId: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return mockUsers.find(u => u.id === userId) || null;
}

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    try {
        const userDoc = doc(db, 'users', userId);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
            // Update existing document
            await updateDoc(userDoc, data);
        } else {
            // Create new document if it doesn't exist
            await setDoc(userDoc, {
                ...data,
                id: userId,
                createdOn: new Date().toISOString(),
                status: 'Inactive',
                role: data.role || 'Student'
            });
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}

export async function updateUserStatus(userId: string, status: 'Active' | 'Inactive'): Promise<void> {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, { status });
}


// Colleges
export async function getColleges(): Promise<College[]> {
  const collegesCol = collection(db, 'colleges');
  const collegeSnapshot = await getDocs(collegesCol);
  if (collegeSnapshot.docs.length > 0) {
    const collegeList = collegeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College));
    return collegeList;
  }
  return mockColleges;
}

export async function addCollege(college: Omit<College, 'id' | 'projectsCount'>) {
    await addDoc(collection(db, 'colleges'), {
        ...college,
        projectsCount: 0,
    });
}

// Projects
export async function getProjects(options: { limit?: number } = {}): Promise<Project[]> {
  const projectsCol = collection(db, 'projects');
  let projectsQuery = query(projectsCol);
  if (options.limit) {
      projectsQuery = query(projectsQuery, queryLimit(options.limit));
  }
  const projectSnapshot = await getDocs(projectsQuery);

  // If no real projects, return mock data
  if (projectSnapshot.empty) {
      const projects = options.limit ? mockProjects.slice(0, options.limit) : mockProjects;
      // Calculate submission counts for mock projects
      projects.forEach(p => {
          p.submissionsCount = mockSubmissions.filter(s => s.projectId === p.id).length;
      });
      return projects;
  }

  const projectList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  
  // Fetch all submissions to calculate counts
  const submissions = await getSubmissions();

  // Map submissions to projects
  for (const project of projectList) {
      project.submissionsCount = submissions.filter(s => s.projectId === project.id).length;
  }

  return projectList;
}

export async function getProjectById(id: string): Promise<Project | null> {
    const projectDoc = doc(db, 'projects', id);
    const projectSnapshot = await getDoc(projectDoc);
    if(projectSnapshot.exists()){
        return { id: projectSnapshot.id, ...projectSnapshot.data() } as Project;
    }
    return mockProjects.find(p => p.id === id) || null;
}

export async function addProject(project: Omit<Project, 'id' | 'submissionsCount' | 'status'> & { description: string }) {
    const collegeRef = doc(db, "colleges", project.collegeId);
    
    await runTransaction(db, async (transaction) => {
        const collegeDoc = await transaction.get(collegeRef);
        if (!collegeDoc.exists()) {
            throw "College document does not exist!";
        }

        const newProjectsCount = (collegeDoc.data().projectsCount || 0) + 1;
        transaction.update(collegeRef, { projectsCount: newProjectsCount });

        const projectRef = doc(collection(db, "projects"));
        transaction.set(projectRef, {
            name: project.name,
            collegeId: project.collegeId,
            collegeName: project.collegeName,
            description: project.description,
            submissionsCount: 0,
            status: 'Ongoing',
        });
    });
}

export async function updateProjectStatus(projectId: string, status: 'Completed'): Promise<void> {
    const projectDoc = doc(db, 'projects', projectId);
    await updateDoc(projectDoc, { status });
}


// Submissions
export async function getSubmissions(): Promise<Submission[]> {
  const submissionsCol = collection(db, 'submissions');
  const submissionSnapshot = await getDocs(submissionsCol);
  if (submissionSnapshot.docs.length > 0) {
    const submissionList = submissionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
    return submissionList;
  }
  return mockSubmissions;
}

export async function getSubmissionsByProjectId(projectId: string): Promise<Submission[]> {
  const submissionsCol = collection(db, 'submissions');
  const q = query(submissionsCol, where('projectId', '==', projectId));
  const submissionSnapshot = await getDocs(q);
  if (submissionSnapshot.docs.length > 0) {
    const submissionList = submissionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
    return submissionList;
  }
  return mockSubmissions.filter(s => s.projectId === projectId);
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
    const submissionDoc = doc(db, 'submissions', id);
    const submissionSnapshot = await getDoc(submissionDoc);
    if(submissionSnapshot.exists()){
        return { id: submissionSnapshot.id, ...submissionSnapshot.data() } as Submission;
    }
    return mockSubmissions.find(s => s.id === id) || null;
}


// Tickets
export async function getTickets(): Promise<Ticket[]> {
  const ticketsCol = collection(db, 'tickets');
  const ticketSnapshot = await getDocs(ticketsCol);
  if (ticketSnapshot.docs.length > 0) {
    const ticketList = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
    return ticketList;
  }
  return mockTickets;
}

// Fetch support tickets from the `supportTickets` collection and map to the Ticket shape
export async function getSupportTickets(): Promise<Ticket[]> {
  const col = collection(db, 'supportTickets');
  const snap = await getDocs(col);
  if (snap.docs.length === 0) {
    return [];
  }

  const toIsoDate = (value: any): string => {
    try {
      if (value?.toDate) {
        // Firestore Timestamp
        return value.toDate().toISOString().slice(0, 10);
      }
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch (_) {}
    return '';
  };

  const tickets: Ticket[] = snap.docs.map((d) => {
    const data: any = d.data();
    return {
      id: d.id,
      subject: typeof data.subject === 'string' && data.subject.trim().length > 0 ? data.subject : (data.message || 'Support request'),
      userName: data.name || data.email || 'User',
      userEmail: data.email || '',
      userId: data.userId || '',
      collegeName: '',
      issueType: 'Support',
      dateRaised: toIsoDate(data.createdAt) || toIsoDate(new Date()),
      dateClosed: null,
      status: data.status === 'Resolved' ? 'Resolved' : 'Open',
      description: data.message || '',
    } as Ticket;
  });

  // Enrich with college name by joining on users collection
  const userIds = tickets.map(t => t.userId).filter(Boolean) as string[];
  const uniqueUserIds = Array.from(new Set(userIds));
  if (uniqueUserIds.length > 0) {
    const usersCol = collection(db, 'users');
    // Firestore doesn't support 'in' for more than 10; for simplicity, fetch individually
    const userDocs = await Promise.all(uniqueUserIds.map(async (uid) => {
      try { const udoc = await getDoc(doc(usersCol, uid)); return udoc.exists() ? { id: uid, ...udoc.data() } as any : null; } catch { return null; }
    }));
    const idToCollege: Record<string, string> = {};
    userDocs.forEach(u => { if (u) idToCollege[u.id] = u.college || u.collegeName || ''; });
    tickets.forEach(t => { if (t.userId && idToCollege[t.userId]) t.collegeName = idToCollege[t.userId]; });
  }

  return tickets;
}

// Attendance
export type FirestoreAttendance = {
  user_id?: string
  userId?: string
  user_name?: string
  userName?: string
  teacher_id?: string
  teacher_name?: string
  college_name?: string
  collegeName?: string
  latitude?: number
  longitude?: number
  timestamp?: string | any
  checkinTime?: string
  checkoutTime?: string
  date?: string
  method?: string
  similarity?: number
  synced?: boolean
  synced_at?: string | any
}

export async function getAttendanceRecords(): Promise<any[]> {
  const colRef = collection(db, 'attendance')
  const snap = await getDocs(colRef)

  const records = snap.docs.map((d) => {
    const data = d.data() as FirestoreAttendance
    const ts = (data as any).timestamp
    const jsDate = (ts && typeof ts === 'object' && 'toDate' in ts)
      ? (ts as any).toDate() as Date
      : new Date(String(ts || ''))

    const isValid = !isNaN(jsDate.getTime())
    const date = isValid ? jsDate.toISOString().slice(0, 10) : ''
    const time = isValid ? jsDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''

    const userName = data.userName || data.user_name || 'Unknown'
    const userId = data.userId || data.user_id || 'unknown'

    return {
      id: d.id,
      userName,
      userId,
      date: data.date || date,
      timestamp: isValid ? jsDate.toISOString() : (typeof ts === 'string' ? ts : ''),
      checkinTime: data.checkinTime || undefined,
      checkoutTime: data.checkoutTime || undefined,
      method: data.method || '',
      similarity: data.similarity ?? '',
      college: data.collegeName || data.college_name || '',
    }
  })

  return records
}

export async function updateTicketStatus(ticketId: string, status: 'Resolved', resolutionDate: string): Promise<void> {
    const ticketDoc = doc(db, 'tickets', ticketId);
    await updateDoc(ticketDoc, { status, dateClosed: resolutionDate });
}

// Colleges
// Duplicate definition removed (consolidated above)

// Notifications
export async function addNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    // Initialize invitation responses if it's an invitation
    let notificationData = {
        ...notification,
        createdAt: new Date().toISOString(),
        readBy: [],
    };

    if (notification.type === 'invitation') {
        // Initialize all recipients with pending status
        const responses: { [userId: string]: { status: 'pending' } } = {};
        notification.recipients.forEach(userId => {
            responses[userId] = { status: 'pending' };
        });
        notificationData.responses = responses;
    }

    const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
    return notificationRef.id;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
    const notificationsCol = collection(db, 'notifications');
    const q = query(notificationsCol, where('recipients', 'array-contains', userId));
    const notificationSnapshot = await getDocs(q);
    if (notificationSnapshot.docs.length > 0) {
        return notificationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    }
    return [];
}

export async function updateInvitationResponse(
    notificationId: string, 
    userId: string, 
    status: 'accepted' | 'declined' | 'maybe',
    message?: string
): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await runTransaction(db, async (transaction) => {
        const notificationDoc = await transaction.get(notificationRef);
        if (notificationDoc.exists()) {
            const data = notificationDoc.data();
            const responses = data.responses || {};
            responses[userId] = {
                status,
                respondedAt: new Date().toISOString(),
                ...(message && { message })
            };
            transaction.update(notificationRef, { responses });
        }
    });
}

export async function getInvitationStats(notificationId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    maybe: number;
}> {
    const notificationDoc = await getDoc(doc(db, 'notifications', notificationId));
    if (!notificationDoc.exists()) {
        throw new Error('Notification not found');
    }
    
    const data = notificationDoc.data();
    const responses = data.responses || {};
    
    const stats = {
        total: Object.keys(responses).length,
        pending: 0,
        accepted: 0,
        declined: 0,
        maybe: 0
    };
    
    Object.values(responses).forEach((response: any) => {
        stats[response.status]++;
    });
    
    return stats;
}

// Circular functions
export async function addCircular(circular: any): Promise<string> {
    try {
        const circularsCol = collection(db, 'circulars');
        const docRef = await addDoc(circularsCol, {
            ...circular,
            createdAt: new Date()
        });
        
        // Create notifications for each recipient
        const notificationsCol = collection(db, 'notifications');
        const notificationPromises = circular.recipients.map(async (userId: string) => {
            return addDoc(notificationsCol, {
                type: 'circular',
                title: `New Circular: ${circular.title}`,
                message: circular.message.substring(0, 100) + (circular.message.length > 100 ? '...' : ''),
                recipients: [userId],
                sender: 'admin',
                refId: docRef.id,
                createdAt: new Date().toISOString(),
                readBy: []
            });
        });
        
        await Promise.all(notificationPromises);
        
        return docRef.id;
    } catch (error) {
        console.error("Error adding circular:", error);
        throw error;
    }
}
