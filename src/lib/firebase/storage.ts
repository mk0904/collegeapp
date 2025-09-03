import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';

const storage = getStorage(app);

export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

// Function to upload a file to firebase storage specifically for circulars
export async function uploadFileToStorage(path: string, file: File): Promise<string> {
  return uploadFile(file, path);
}
