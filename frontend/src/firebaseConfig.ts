// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQNAEj9a0GyexXvVNb0HaM_FhsWcHRIfI",
  authDomain: "fleet-automata-460507-p5.firebaseapp.com",
  projectId: "fleet-automata-460507-p5",
  storageBucket: "fleet-automata-460507-p5.firebasestorage.app",
  messagingSenderId: "899268025543",
  appId: "1:899268025543:web:19f66953913c3a214f32e2",
  measurementId: "G-WFHC1J8V0P"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication
export const auth = getAuth(app);