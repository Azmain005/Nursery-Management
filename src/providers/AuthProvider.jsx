import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../Auth/firebase.init";
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //creating a user
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };
  //sign in a user
  const signInUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };
  //sign in with google
  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, provider);
  };
  //sign out a user
  const signOutUser = () => {
    setLoading(true);
    return signOut(auth);
  };
  //setting the user state
  //checking if the user is logged in or not
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed. Current user:", currentUser); // Debug log
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // database settings

  //adding user to the database
  const addUserToDatabase = async (user) => {
    try {
      await setDoc(doc(db, "user_data", user.uid), {
        email: user.email,
        role: "Vendor",
      });
    } catch (error) {
      console.error("Error adding user to database:", error);
    }
  };

  // get role from database
  const getRoleFromDatabase = async (user) => {
    try {
      const docRef = doc(db, "user_data", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data().role;
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error getting role from database:", error);
    }
  };

  // get user data from database
  const getUserData = async (user) => {
    console.log("getUserData called with user:", user); // Debug log
    try {
      const docRef = doc(db, "user_data", user.uid);
      const docSnap = await getDoc(docRef);
      console.log(
        "Firestore document snapshot:",
        docSnap.exists() ? docSnap.data() : "No document"
      ); // Debug log
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No such document!");
        return { role: "Not set" }; // Return default data if document doesn't exist
      }
    } catch (error) {
      console.error("Error getting user data from database:", error);
      return { role: "Not set" }; // Return default data on error
    }
  };

  // Add plant to database
  // const addPlantToDatabase = async (plant) => {
  //   try {
  //     // Method 1: Let Firebase generate a random ID
  //     const plantsRef = collection(db, "plants");
  //     await addDoc(plantsRef, {
  //       name: plant.name,
  //       stage: "Seed",
  //       original_plant_id: plant.original_plant_id,
  //       price: plant.price,
  //       image: plant.image,
  //       sci_name: plant.sci_name,
  //       planting_date: plant.planting_date,
  //       harvest_date: plant.harvest_date,
  //       stock: plant.stock,
  //       categories: plant.categories,
  //     });
  //   } catch (error) {
  //     console.error("Error adding plant to database:", error.message);
  //     // Log more detailed error information
  //     console.error("Full error:", error);
  //     console.error("Plant data:", plant);
  //   }
  // };
  const addPlantToDatabase = async (plant) => {
    try {
      const plantsRef = collection(db, "plants");

      // Step 1: Check if the plant already exists by original_plant_id
      const q = query(
        plantsRef,
        where("original_plant_id", "==", plant.original_plant_id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Step 2: Plant exists, update stock
        const existingDoc = querySnapshot.docs[0];
        const existingData = existingDoc.data();
        const newStock = parseInt(existingData.stock) + parseInt(plant.stock);
        const newPrice = plant.price;
        await updateDoc(doc(db, "plants", existingDoc.id), {
          stock: newStock,
          price: newPrice,
        });

        console.log(`Updated stock for existing plant ID ${existingDoc.id}`);
      } else {
        // Step 3: Plant doesn't exist, add new
        await addDoc(plantsRef, {
          name: plant.name,
          stage: "Seed",
          original_plant_id: plant.original_plant_id,
          price: plant.price,
          image: plant.image,
          sci_name: plant.sci_name,
          planting_date: plant.planting_date,
          harvest_date: plant.harvest_date,
          stock: plant.stock,
          categories: plant.categories,
        });

        console.log("Added new plant to database");
      }
    } catch (error) {
      console.error("Error processing plant:", error.message);
      console.error("Full error:", error);
      console.error("Plant data:", plant);
    }
  };

  // get plants from inventory
  const getPlantsFromInventory = async () => {
    {
      return getDocs(collection(db, "inventory"));
    }
  };

  // get plants from database
  const getPlantsFromDatabase = async () => {
    return getDocs(collection(db, "plants"));
  };

  // add to inventory
  const addToInventory = async (inventoryData) => {
    addDoc(collection(db, "inventory"), inventoryData);
  };

  // delete from inventory
  const deleteFromInventory = async (id) => {
    deleteDoc(doc(db, "plants", id));
  };
  //remove from inventory
  const removeFromInventory = async (id) => {
    deleteDoc(doc(db, "inventory", id));
  };

  const authInfo = {
    user,
    loading,
    createUser,
    signInUser,
    signInWithGoogle,
    signOutUser,
    addUserToDatabase,
    getRoleFromDatabase,
    getUserData,
    addPlantToDatabase,
    getPlantsFromInventory,
    getPlantsFromDatabase,
    addToInventory,
    deleteFromInventory,
    removeFromInventory,
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};
export default AuthProvider;
