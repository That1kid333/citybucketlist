import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

interface UploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
  fileName: string;
}

export async function uploadImage(file: File, path: string): Promise<UploadResult> {
  try {
    console.log('Starting image upload process...', { fileName: file.name, fileSize: file.size, fileType: file.type });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('Image size should be less than 5MB');
    }

    console.log('Creating storage reference...', { path });
    const storageRef = ref(storage, path);

    // Upload the file
    console.log('Uploading file...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('File uploaded successfully', { snapshot });

    // Get the download URL
    console.log('Getting download URL...');
    const url = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained', { url });

    return {
      url,
      path,
      size: file.size,
      contentType: file.type,
      fileName: file.name
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function validateImage(file: File): Promise<void> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('Image size should be less than 5MB');
  }

  // Validate image dimensions
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxDimension = 4096; // Maximum dimension allowed
      if (img.width > maxDimension || img.height > maxDimension) {
        reject(new Error(`Image dimensions should not exceed ${maxDimension}x${maxDimension} pixels`));
      }
      resolve();
    };
    img.onerror = () => reject(new Error('Failed to load image for validation'));
    img.src = URL.createObjectURL(file);
  });
}
