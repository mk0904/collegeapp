import { collection, doc, getDoc, getDocs, getFirestore, query, where, updateDoc, limit as queryLimit, addDoc } from 'firebase/firestore';
import { app } from '../firebase';
import type { User, School, Project, Submission, Ticket } from '../mock-data';

const db = getFirestore(app);

// Users
export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  return userList;
}

export async function updateUserStatus(userId: string, status: 'Active' | 'Inactive'): Promise<void> {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, { status });
}


// Schools
export async function getSchools(): Promise<School[]> {
  const schoolsCol = collection(db, 'schools');
  const schoolSnapshot = await getDocs(schoolsCol);
  const schoolList = schoolSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
  return schoolList;
}

export async function addSchool(school: Omit<School, 'id' | 'projectsCount'>) {
    await addDoc(collection(db, 'schools'), {
        ...school,
        projectsCount: 0,
    });
}

// Projects
export async function getProjects(options: { limit?: number } = {}): Promise<Project[]> {
  let projectsQuery = query(collection(db, 'projects'));
  if (options.limit) {
      projectsQuery = query(projectsQuery, queryLimit(options.limit));
  }
  const projectSnapshot = await getDocs(projectsQuery);
  const projectList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  return projectList;
}

export async function getProjectById(id: string): Promise<Project | null> {
    const projectDoc = doc(db, 'projects', id);
    const projectSnapshot = await getDoc(projectDoc);
    if(projectSnapshot.exists()){
        return { id: projectSnapshot.id, ...projectSnapshot.data() } as Project;
    }
    return null;
}

// Submissions
export async function getSubmissionsByProjectId(projectId: string): Promise<Submission[]> {
  const submissionsCol = collection(db, 'submissions');
  const q = query(submissionsCol, where('projectId', '==', projectId));
  const submissionSnapshot = await getDocs(q);
  const submissionList = submissionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
  return submissionList;
}


// Tickets
export async function getTickets(): Promise<Ticket[]> {
  const ticketsCol = collection(db, 'tickets');
  const ticketSnapshot = await getDocs(ticketsCol);
  const ticketList = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
  return ticketList;
}
