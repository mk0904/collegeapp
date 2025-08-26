import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp, 
  Timestamp,
  updateDoc,
  deleteDoc,
  where
} from 'firebase/firestore';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  budget?: number;
  assignedColleges: string[]; // College IDs
  assignedUsers: string[]; // User IDs
  documents?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Creates a new project in Firebase
 */
export async function createProject(projectData: {
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate: Date | null;
  endDate: Date | null;
  budget?: number;
  assignedColleges: string[];
  assignedUsers: string[];
  documents?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  createdBy: string;
}): Promise<string> {
  try {
    const projectsRef = collection(db, 'projects');
    const now = serverTimestamp();
    
    // Convert JavaScript Date objects to Firestore Timestamps
    const startTimestamp = projectData.startDate ? Timestamp.fromDate(projectData.startDate) : null;
    const endTimestamp = projectData.endDate ? Timestamp.fromDate(projectData.endDate) : null;
    
    const docRef = await addDoc(projectsRef, {
      ...projectData,
      startDate: startTimestamp,
      endDate: endTimestamp,
      createdAt: now,
      updatedAt: now
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Fetches all projects from Firebase, ordered by creation date
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Fetches projects assigned to a specific college
 */
export async function getProjectsByCollege(collegeId: string): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef, 
      where('assignedColleges', 'array-contains', collegeId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error(`Error fetching projects for college ${collegeId}:`, error);
    return [];
  }
}

/**
 * Fetches projects assigned to a specific user
 */
export async function getProjectsByUser(userId: string): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef, 
      where('assignedUsers', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error(`Error fetching projects for user ${userId}:`, error);
    return [];
  }
}

/**
 * Fetches projects by status
 */
export async function getProjectsByStatus(status: 'planning' | 'in-progress' | 'completed' | 'on-hold'): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef, 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error(`Error fetching projects with status ${status}:`, error);
    return [];
  }
}

/**
 * Fetches a specific project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, 'projects', id);
    const snapshot = await getDoc(projectRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Project;
  } catch (error) {
    console.error(`Error fetching project with id ${id}:`, error);
    return null;
  }
}

/**
 * Updates a project in Firebase
 */
export async function updateProject(id: string, projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'createdBy' | 'updatedAt'>>): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', id);
    
    // Handle date conversions if they're included
    let dataToUpdate: any = { ...projectData };
    
    if (projectData.startDate && projectData.startDate instanceof Date) {
      dataToUpdate.startDate = Timestamp.fromDate(projectData.startDate);
    }
    
    if (projectData.endDate && projectData.endDate instanceof Date) {
      dataToUpdate.endDate = Timestamp.fromDate(projectData.endDate);
    }
    
    await updateDoc(projectRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating project with id ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a project from Firebase
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', id);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error(`Error deleting project with id ${id}:`, error);
    throw error;
  }
}
