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

export interface College {
  id: string;
  name: string;
  district: string;
  address: string;
  principalName?: string;
  principalEmail?: string;
  principalPhone?: string;
  email?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  projectsCount?: number;
  usersCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Creates a new college in Firebase
 */
export async function createCollege(collegeData: {
  name: string;
  district: string;
  address: string;
  principalName?: string;
  principalEmail?: string;
  principalPhone?: string;
}): Promise<string> {
  try {
    const collegesRef = collection(db, 'colleges');
    const now = serverTimestamp();
    const docRef = await addDoc(collegesRef, {
      ...collegeData,
      createdAt: now,
      updatedAt: now
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating college:', error);
    throw error;
  }
}

/**
 * Fetches all colleges from Firebase, ordered by name
 */
export async function getAllColleges(): Promise<College[]> {
  try {
    const collegesRef = collection(db, 'colleges');
    const q = query(collegesRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as College[];
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return [];
  }
}

/**
 * Fetches colleges by district
 */
export async function getCollegesByDistrict(district: string): Promise<College[]> {
  try {
    const collegesRef = collection(db, 'colleges');
    const q = query(
      collegesRef, 
      where('district', '==', district),
      orderBy('name', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as College[];
  } catch (error) {
    console.error(`Error fetching colleges in district ${district}:`, error);
    return [];
  }
}

/**
 * Fetches a specific college by ID
 */
export async function getCollegeById(id: string): Promise<College | null> {
  try {
    const collegeRef = doc(db, 'colleges', id);
    const snapshot = await getDoc(collegeRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as College;
  } catch (error) {
    console.error(`Error fetching college with id ${id}:`, error);
    return null;
  }
}

/**
 * Updates a college in Firebase
 */
export async function updateCollege(id: string, collegeData: Partial<Omit<College, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  try {
    const collegeRef = doc(db, 'colleges', id);
    await updateDoc(collegeRef, {
      ...collegeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating college with id ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a college from Firebase
 */
export async function deleteCollege(id: string): Promise<void> {
  try {
    const collegeRef = doc(db, 'colleges', id);
    await deleteDoc(collegeRef);
  } catch (error) {
    console.error(`Error deleting college with id ${id}:`, error);
    throw error;
  }
}
