
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
                status: 'Active',
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

export async function updateTicketStatus(ticketId: string, status: 'Resolved', resolutionDate: string): Promise<void> {
    const ticketDoc = doc(db, 'tickets', ticketId);
    await updateDoc(ticketDoc, { status, dateClosed: resolutionDate });
}

// Colleges
export async function addSchool(college: any): Promise<void> {
    await addDoc(collection(db, 'colleges'), {
        ...college,
        createdAt: new Date().toISOString(),
    });
}

// Notifications
export async function addNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    const notificationRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: new Date().toISOString(),
        readBy: [],
    });
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

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await runTransaction(db, async (transaction) => {
        const notificationDoc = await transaction.get(notificationRef);
        if (notificationDoc.exists()) {
            const data = notificationDoc.data();
            const readBy = data.readBy || [];
            if (!readBy.includes(userId)) {
                transaction.update(notificationRef, {
                    readBy: [...readBy, userId]
                });
            }
        }
    });
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
                userId,
                type: 'circular',
                title: `New Circular: ${circular.title}`,
                message: circular.message.substring(0, 100) + (circular.message.length > 100 ? '...' : ''),
                refId: docRef.id,
                createdAt: new Date(),
                read: false
            });
        });
        
        await Promise.all(notificationPromises);
        
        return docRef.id;
    } catch (error) {
        console.error("Error adding circular:", error);
        throw error;
    }
}
