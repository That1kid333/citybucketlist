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