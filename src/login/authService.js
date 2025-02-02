import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import app from "./firebaseConfig";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user.email;
  } catch (error) {
    alert("Error logging in: " + error.message);
    return null;
  }
};

export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user.email;
  } catch (error) {
    alert("Error logging in: " + error.message);
    return null;
  }
};
