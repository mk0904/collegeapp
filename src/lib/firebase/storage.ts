import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export interface FirebaseStorageFile {
  name: string;
  url: string;
  type: string;
  size: number;
  path: string; // Storage path in Firebase
}

/**
 * Upload a single file to Firebase Storage
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload a file and return detailed information
 */
export async function uploadFileWithMetadata(
  file: File,
  path: string
): Promise<FirebaseStorageFile> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  if (!file || !file.name) {
    throw new Error('Invalid file provided');
  }

  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      name: file.name,
      url: downloadURL,
      type: file.type || 'application/octet-stream',
      size: file.size || 0,
      path: path,
    };
  } catch (error) {
    console.error('Error in uploadFileWithMetadata:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload multiple files to Firebase Storage
 */
export async function uploadMultipleFiles(
  files: File[],
  basePath: string = 'uploads',
  folder?: string
): Promise<FirebaseStorageFile[]> {
  if (!files || files.length === 0) {
    return [];
  }

  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  const uploadPromises = files.map(async (file, index) => {
    try {
      // Generate unique filename with timestamp and random number
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = folder 
        ? `${basePath}/${folder}/${timestamp}_${random}_${index}_${sanitizedName}`
        : `${basePath}/${timestamp}_${random}_${index}_${sanitizedName}`;
      
      return await uploadFileWithMetadata(file, filePath);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Upload files for circulars
 */
export async function uploadCircularFiles(files: File[]): Promise<FirebaseStorageFile[]> {
  return uploadMultipleFiles(files, 'circulars', 'attachments');
}

/**
 * Upload files for notifications
 */
export async function uploadNotificationFiles(files: File[]): Promise<FirebaseStorageFile[]> {
  return uploadMultipleFiles(files, 'notifications', 'attachments');
}

/**
 * Upload files for project submissions
 */
export async function uploadProjectSubmissionFiles(files: File[]): Promise<FirebaseStorageFile[]> {
  return uploadMultipleFiles(files, 'projects', 'submissions');
}

/**
 * Upload files for events
 */
export async function uploadEventFiles(files: File[]): Promise<FirebaseStorageFile[]> {
  return uploadMultipleFiles(files, 'events', 'images');
}

/**
 * Legacy function for backward compatibility
 */
export async function uploadFileToStorage(path: string, file: File): Promise<string> {
  return uploadFile(file, path);
}
