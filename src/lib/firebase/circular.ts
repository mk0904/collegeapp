// Import Firebase dependencies
import { collection, addDoc, updateDoc, getDoc, getDocs, query, where, Timestamp, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Function to add a circular
export async function addCircular(circularData: {
  title: string;
  message: string;
  files: Array<{
    id?: string;
    url: string;
    name: string;
    type: string;
    size?: number;
  }>;
  recipients: string[];
  createdBy: string;
}): Promise<{ id: string }> {
  try {
    // Create a data object to save to Firestore
    const data = {
      title: circularData.title,
      message: circularData.message,
      files: circularData.files,
      recipients: circularData.recipients,
      recipientCount: circularData.recipients.length,
      createdBy: circularData.createdBy,
      createdAt: serverTimestamp(),
      status: 'Sent',
      sentDate: Timestamp.now(),
    };
    
    // Add the document to Firestore
    const docRef = await addDoc(collection(db, 'circulars'), data);
    
    console.log('Circular created with ID:', docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error adding circular:', error);
    throw error;
  }
}

// Function to get a circular by ID
export async function getCircularById(id: string) {
  try {
    const docRef = doc(db, 'circulars', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Circular not found');
    }
  } catch (error) {
    console.error('Error getting circular:', error);
    throw error;
  }
}

// Function to get all circulars
export async function getAllCirculars() {
  try {
    const circularsCollection = collection(db, 'circulars');
    const querySnapshot = await getDocs(circularsCollection);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting circulars:', error);
    throw error;
  }
}

// Function to get circulars by status
export async function getCircularsByStatus(status: string) {
  try {
    const circularsCollection = collection(db, 'circulars');
    const q = query(circularsCollection, where('status', '==', status));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting circulars by status:', error);
    throw error;
  }
}
