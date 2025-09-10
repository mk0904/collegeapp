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
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    public_id?: string;
    format?: string;
    resource_type?: string;
  }>;
  recipients: string[];
  createdBy: string;
}): Promise<{ id: string }> {
  try {
    // Validate input data
    if (!circularData.title) throw new Error('Title is required');
    if (!circularData.message) throw new Error('Message is required');
    if (!circularData.createdBy) throw new Error('CreatedBy is required');
    if (!Array.isArray(circularData.recipients)) throw new Error('Recipients must be an array');
    
    // Create a data object to save to Firestore
    const data: any = {
      title: circularData.title,
      message: circularData.message,
      files: circularData.files || [],
      recipients: circularData.recipients,
      recipientCount: circularData.recipients.length,
      createdBy: circularData.createdBy,
      createdAt: serverTimestamp(),
      status: 'Sent',
      sentDate: Timestamp.now(),
    };
    
    // Add attachments if they exist and are valid
    if (circularData.attachments && Array.isArray(circularData.attachments)) {
      data.attachments = circularData.attachments;
    }
    
    // Final validation - remove any undefined values
    const cleanData = (obj: any): any => {
      if (obj === null || obj === undefined) return null;
      if (typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) {
        return obj.map(cleanData).filter(item => item !== undefined);
      }
      const cleaned: any = {};
      for (const key in obj) {
        if (obj[key] !== undefined) {
          cleaned[key] = cleanData(obj[key]);
        }
      }
      return cleaned;
    };
    
    const finalData = cleanData(data);
    console.log('Final data being saved to Firestore:', finalData);
    
    // Add the document to Firestore
    const docRef = await addDoc(collection(db, 'circulars'), finalData);
    
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
