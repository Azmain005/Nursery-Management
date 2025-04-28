import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import db from "../../firebase.config";

const userCollection = collection(db, "user_data");

export const addUser = async (user) => {
  return await addDoc(userCollection, user);
};

export const getUsers = async () => {
  const snapshot = await getDocs(userCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Function to check email and return the role
export const getUserRoleByEmail = async (email) => {
  const q = query(userCollection, where("email", "==", email));
  const snapshot = await getDocs(q);
  const user = snapshot.docs.map((doc) => doc.data())[0];
  return user ? user.role : null; // Return role if user exists, otherwise null
};