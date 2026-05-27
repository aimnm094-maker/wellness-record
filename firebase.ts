import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7PInxIQmMprGii1Lp3RbydnRMMmLAc5g",
  authDomain: "wellness-record-4c914.firebaseapp.com",
  projectId: "wellness-record-4c914",
  storageBucket: "wellness-record-4c914.firebasestorage.app",
  messagingSenderId: "8398060958",
  appId: "1:8398060958:web:77c88c1fb5a53f5f53ea8f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
