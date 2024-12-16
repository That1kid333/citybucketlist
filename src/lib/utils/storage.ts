import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export function getStoragePath(type: 'document' | 'profile' | 'licenses' | 'background-checks', userId: string, filename: string): string {
  return `${type}/${userId}/${filename}`;
}

export const uploadDriverPhoto = async (file: File, driverId: string): Promise<string> => {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `driver-photos/${driverId}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Failed to upload photo. Please try again.');
  }
};