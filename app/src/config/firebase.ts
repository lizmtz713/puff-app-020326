import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDXdCHRYo5X9o7jOkGWPzenKq6KB-Dpk5I",
  authDomain: "puff-app-f1ba0.firebaseapp.com",
  projectId: "puff-app-f1ba0",
  storageBucket: "puff-app-f1ba0.firebasestorage.app",
  messagingSenderId: "269952574168",
  appId: "1:269952574168:web:eb33f53c80dda6d147adad",
  measurementId: "G-GJMSNVFWBR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
