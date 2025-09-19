import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Firebase configuration - replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyDujLUK8v7MG3YDowbdNm6_KdDEU0XrpoI",
  authDomain: "scout-festival-2025.firebaseapp.com",
  projectId: "scout-festival-2025",
  storageBucket: "scout-festival-2025.firebasestorage.app",
  messagingSenderId: "185478183601",
  appId: "1:185478183601:web:be1dd429aae3eae609c090",
  measurementId: "G-NTYYE6M9JR",
};
const collectionName = "registrations";

// Sign in anonymously
const singIn = (authentication: any) => {
  signInAnonymously(authentication)
    .then(() => {
      console.log("Signed in anonymously");
    })
    .catch((error) => {
      console.error("Anonymous sign-in error:", error);
    });
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
singIn(auth);
const db = getFirestore(app);

export { db, collectionName, collection, addDoc, getDocs };
