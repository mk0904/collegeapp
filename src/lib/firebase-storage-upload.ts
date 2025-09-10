'use client';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';

const storage = getStorage(app);

/**
 * Upload a single file to Firebase Storage
 */
export async function uploadFileToFirebaseStorage(
  file: File,
  options: {
    folder?: string;
    fileName?: string;
  } = {}
): Promise<{
  name: string;
  url: string;
  size: number;
  type: string;
  path: string;
}> {
  try {
    // Generate unique file path
    const timestamp = Date.now();
    const fileName = options.fileName || `${timestamp}_${file.name}`;
    const folder = options.folder || 'uploads';
    const filePath = `${folder}/${fileName}`;
    
    console.log(`Uploading ${file.name} to Firebase Storage: ${filePath}`);
    
    // Create storage reference
    const storageRef = ref(storage, filePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`Successfully uploaded ${file.name}:`, {
      path: filePath,
      url: downloadURL,
      size: file.size
    });
    
    return {
      name: file.name,
      url: downloadURL,
      size: file.size,
      type: file.type,
      path: filePath
    };
  } catch (error) {
    console.error(`Error uploading ${file.name} to Firebase Storage:`, error);
    throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload multiple files to Firebase Storage
 */
export async function uploadMultipleFilesToFirebaseStorage(
  files: File[],
  options: {
    folder?: string;
  } = {}
): Promise<Array<{
  name: string;
  url: string;
  size: number;
  type: string;
  path: string;
}>> {
  console.log(`Starting upload of ${files.length} files to Firebase Storage...`);
  
  const uploadPromises = files.map(async (file, index) => {
    try {
      const result = await uploadFileToFirebaseStorage(file, {
        folder: options.folder || 'circulars',
        fileName: `${Date.now()}_${index}_${file.name}`
      });
      
      console.log(`✅ Uploaded ${index + 1}/${files.length}: ${file.name}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error);
      throw error;
    }
  });
  
  const results = await Promise.all(uploadPromises);
  console.log(`🎉 All ${files.length} files uploaded successfully to Firebase Storage!`);
  
  return results;
}

/**
 * Test if a Firebase Storage URL is accessible
 */
export async function testFirebaseStorageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Firebase Storage URL test failed:', error);
    return false;
  }
}

