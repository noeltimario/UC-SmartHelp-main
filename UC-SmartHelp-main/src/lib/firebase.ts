import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your real web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwr0NAzEKOfd1M9pnRYSw7uYpmpHDLsdk",
  authDomain: "uc-smarthelp-1d3ba.firebaseapp.com",
  projectId: "uc-smarthelp-1d3ba",
  storageBucket: "uc-smarthelp-1d3ba.firebasestorage.app",
  messagingSenderId: "870671178304",
  appId: "1:870671178304:web:ce4a2b99e09e50cd431da5",
  measurementId: "G-QXTYFDPMYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Google Provider for your Login.tsx
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Forces Google to show the account picker every time
googleProvider.setCustomParameters({
  prompt: 'select_account'
});