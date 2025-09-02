// This file will be populated with your Firebase configuration.
// For now, it is a placeholder.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  "projectId": "classroom-companion-vvcmc",
  "appId": "1:275727972469:web:4a8d25b74554b3824be03c",
  "storageBucket": "classroom-companion-vvcmc.firebasestorage.app",
  "apiKey": "AIzaSyDK1j7KMlWewz0Xx3KE6XtXGzaUXV7-7KU",
  "authDomain": "classroom-companion-vvcmc.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "275727972469"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
