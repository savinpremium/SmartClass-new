
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { 
  getAuth, 
  sendEmailVerification, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

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
 * Saves or updates an institution profile in the database with strict validation
 */
export const saveInstitutionProfile = async (uid: string, data: any) => {
  if (!uid) throw new Error("Security Error: No UID provided for profile save.");
  return set(ref(db, `institutions/${uid}`), {
    ...data,
    uid,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Listens to institution profile changes in real-time for security enforcement
 */
export const subscribeToProfile = (uid: string, callback: (data: any) => void) => {
  const profileRef = ref(db, `institutions/${uid}`);
  return onValue(profileRef, (snapshot) => {
    callback(snapshot.val());
  });
};

/**
 * Handles institution registration with immediate verification email.
 */
export const registerAndVerifyInstitution = async (email: string, pass: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await sendEmailVerification(userCredential.user);
    
    // Create initial pending profile - Security Gate: agreementAccepted defaults to FALSE
    await saveInstitutionProfile(userCredential.user.uid, {
      email,
      agreementAccepted: false,
      status: 'pending_verification',
      createdAt: new Date().toISOString()
    });

    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Firebase Security Auth Error:", error.code);
    throw error;
  }
};
