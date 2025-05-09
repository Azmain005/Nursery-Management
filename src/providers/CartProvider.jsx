// src/providers/CartProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../Auth/firebase.init";
import { AuthContext } from "./AuthProvider";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }
    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid)
    );
    
    const unsub = onSnapshot(q, (snap) =>
      setCartItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [user]);

  // Add a plant to cart
  const addToCart = async (plant) => {
    await addDoc(collection(db, "cart"), {
      userId: user.uid,
      plantId: plant.id,
      name: plant.name,
      price: plant.price,
      image: plant.image,
      quantity: 1,
    });
  };

  // Remove item from cart 
  const removeFromCart = async (cartItemId) => {
    await deleteDoc(doc(db, "cart", cartItemId));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}
