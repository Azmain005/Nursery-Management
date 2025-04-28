// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKgj9GPMNjj4Tdq-tyHA8p87sQ927lxeU",
  authDomain: "nursery-management-5a22a.firebaseapp.com",
  projectId: "nursery-management-5a22a",
  storageBucket: "nursery-management-5a22a.firebasestorage.app",
  messagingSenderId: "179174653639",
  appId: "1:179174653639:web:76cb55498ee06d97edc8e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);