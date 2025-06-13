// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIArP0cxOBH_RGBOUYxVwCgQz9Hvm6zWs",
  authDomain: "livesolve-app.firebaseapp.com",
  projectId: "livesolve-app",
  storageBucket: "livesolve-app.firebasestorage.app",
  messagingSenderId: "845691958424",
  appId: "1:845691958424:web:67a60cbc508d6ba8210ced"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication
export const auth = getAuth(app);