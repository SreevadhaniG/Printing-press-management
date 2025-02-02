// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDv8pUr6Ry8k-eWLzFvH9_R7z4Zt_eT8EI",
  authDomain: "pentagon-press-auth.firebaseapp.com",
  projectId: "pentagon-press-auth",
  storageBucket: "pentagon-press-auth.firebasestorage.app",
  messagingSenderId: "1079587287749",
  appId: "1:1079587287749:web:c1b1fbcaed3344304eb6ac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
