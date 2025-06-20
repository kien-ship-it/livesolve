// frontend/src/firebaseConfig.ts

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // For image uploads
import { getAnalytics } from "firebase/analytics";

// --- START: Securely load environment variables ---

// This object maps to the variables in your .env.local file.
const VITE_ENV = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Safety Check: This will throw a clear error during development if a variable is missing.
for (const [key, value] of Object.entries(VITE_ENV)) {
  if (!value) {
    // This makes debugging easier by telling you exactly which variable is missing.
    throw new Error(`Missing Firebase environment variable: import.meta.env.VITE_FIREBASE_${key.toUpperCase()}`);
  }
}

// Your web app's Firebase configuration, now built securely
const firebaseConfig = VITE_ENV;

// --- END: Secure loading logic ---


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services for use in other parts of your app
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Optional: export the app instance itself if needed
export default app;