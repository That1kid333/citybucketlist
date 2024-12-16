import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBHMUJxU_XmTs30LlS-blhyKbB9klyzG7s",
  authDomain: "city-bucket-list.firebaseapp.com",
  projectId: "city-bucket-list",
  storageBucket: "city-bucket-list.firebasestorage.app",
  messagingSenderId: "134655988887",
  appId: "1:134655988887:web:7b986cb744465c8463c5d2",
  measurementId: "G-FR07PQN8FC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export app for use in other files
export default app;