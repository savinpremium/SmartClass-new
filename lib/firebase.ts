
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { 
  getAuth, 
  sendEmailVerification, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDneDiUzFALG_DcH1gNJmzB0WIddQcDxsA",
  authDomain: "lms-e-6f847.firebaseapp.com",
  databaseURL: "https://lms-e-6f847-default-rtdb.firebaseio.com",
  projectId: "lms-e-6f847",
  storageBucket: "lms-e-6f847.firebasestorage.app",
  messagingSenderId: "500541616456",
  appId: "1:500541616456:web:db41d2f2b2be2787c0c37d",
  measurementId: "G-X4PS6F2YJ6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

/**
 * Handles institution registration with specific logic for 'operation-not-allowed'.
 */
export const registerAndVerifyInstitution = async (email: string, pass: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await sendEmailVerification(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Firebase Auth Trace:", error.code, error.message);
    
    // Explicit instructions for the specific 'operation-not-allowed' error
    if (error.code === 'auth/operation-not-allowed') {
      const errorMsg = "CRITICAL: Email/Password provider is currently DISABLED in the Firebase Console. Please enable it in 'Authentication > Sign-in method' for project lms-e-6f847.";
      throw new Error(errorMsg);
    }
    
    throw error;
  }
};
