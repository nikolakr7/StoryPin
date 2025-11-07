import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyCuRG_LQz7TrfYeQZhk3gKIx8iZ2i3VzEU",

  authDomain: "first-hackathon-163ce.firebaseapp.com",

  projectId: "first-hackathon-163ce",

  storageBucket: "first-hackathon-163ce.firebasestorage.app",

  messagingSenderId: "587438600846",

  appId: "1:587438600846:web:810a0413a162857703cfdf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
