import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDv8pUr6Ry8k-eWLzFvH9_R7z4Zt_eT8EI",
    authDomain: "pentagon-press-auth.firebaseapp.com",
    projectId: "pentagon-press-auth",
    storageBucket: "pentagon-press-auth.firebasestorage.app",
    messagingSenderId: "1079587287749",
    appId: "1:1079587287749:web:c1b1fbcaed3344304eb6ac"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);