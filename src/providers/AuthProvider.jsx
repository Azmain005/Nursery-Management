import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../Auth/firebase.init";
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
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const authInfo = {
    user,
    loading,
    createUser,
    signInUser,
    signInWithGoogle,
    signOutUser,
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};
export default AuthProvider;
