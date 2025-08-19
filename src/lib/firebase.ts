import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "nagaadmin-jx040",
  appId: "1:778629972337:web:9706b7ef2baa06222fb6d0",
  storageBucket: "nagaadmin-jx040.firebasestorage.app",
  apiKey: "AIzaSyDaglrklj3tUuF5ureqboHMy6zbMCqh8lc",
  authDomain: "nagaadmin-jx040.firebaseapp.com",
  messagingSenderId: "778629972337",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
