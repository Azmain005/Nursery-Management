// src/providers/CartProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot,
  runTransaction,
  writeBatch
} from "firebase/firestore";
import { db } from "../Auth/firebase.init";
import { AuthContext } from "./AuthProvider";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);

  // subscribe to /cart?userId==…
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }
    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(q, snap =>
      setCartItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [user]);

  // Add a plant—if it’s already there, bump its quantity
  const addToCart = async (plant) => {
    const col = collection(db, "cart");
    const q = query(
      col,
      where("userId", "==", user.uid),
      where("plantId", "==", plant.id)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      // increment existing line
      const existing = snap.docs[0];
      const oldQty = existing.data().quantity || 0;
      await updateDoc(existing.ref, { quantity: oldQty + 1 });
    } else {
      // brand‐new line
      await addDoc(col, {
        userId: user.uid,
        plantId: plant.id,
        name: plant.name,
        price: plant.price,
        image: plant.image,
        quantity: 1,
      });
    }
  };

  // Remove one line from cart AND restore its stock in inventory
  const removeFromCart = async (cartItem) => {
    const cartRef = doc(db, "cart", cartItem.id);
    const invRef  = doc(db, "inventory", cartItem.plantId);

    try {
      await runTransaction(db, async tx => {
        const invSnap = await tx.get(invRef);
        const currentStock = invSnap.exists() ? invSnap.data().stock || 0 : 0;
        tx.update(invRef, { stock: currentStock + cartItem.quantity });
        tx.delete(cartRef);
      });
      // update local state to remove it immediately
      setCartItems(items => items.filter(i => i.id !== cartItem.id));
    } catch (err) {
      console.error("Failed to remove from cart & restore stock:", err);
      alert(`Could not remove item: ${err.message}`);
    }
  };

  // Clear entire cart (used after checkout)
  const clearCart = async () => {
    const batch = writeBatch(db);
    cartItems.forEach(item => {
      const cartRef = doc(db, "cart", item.id);
      batch.delete(cartRef);
    });
    await batch.commit();
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
