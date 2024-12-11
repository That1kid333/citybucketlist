import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadImage(file: File, path: string): Promise<string> {
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

    // Create metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };

    console.log('Starting file upload with metadata...', { metadata });
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    if (!snapshot) {
      console.error('Upload failed - no snapshot returned');
      throw new Error('Upload failed - no snapshot returned');
    }

    console.log('File uploaded successfully, getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    if (!downloadURL) {
      console.error('Failed to get download URL');
      throw new Error('Upload failed - no download URL returned');
    }

    console.log('Image upload completed successfully', { downloadURL });
    return downloadURL;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image');
  }
}
