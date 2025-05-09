// src/providers/CartProvider.jsx
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  where
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
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
    const unsub = onSnapshot(q, snap =>
      setCartItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [user]);

  const addToCart = async plant => {
    await addDoc(collection(db, "cart"), {
      userId: user.uid,
      plantId: plant.id,
      name: plant.name,
      price: plant.price,
      image: plant.image,
      quantity: 1,
    });
  };

  const removeFromCart = async cartItem => {
    const cartRef = doc(db, "cart", cartItem.id);
    const invRef = doc(db, "inventory", cartItem.plantId);

    try {
      await runTransaction(db, async tx => {
        // 1️⃣ Read the current stock first
        const invSnap = await tx.get(invRef);
        const currentStock = invSnap.exists()
          ? invSnap.data().stock || 0
          : 0;

        // 2️⃣ Update the stock
        tx.update(invRef, {
          stock: currentStock + cartItem.quantity,
        });

        // 3️⃣ Only after all reads, delete the cart line
        tx.delete(cartRef);
      });

      // 4️⃣ Update local state
      setCartItems(items =>
        items.filter(i => i.id !== cartItem.id)
      );
    } catch (err) {
      console.error("Failed to remove from cart & restore stock:", err);
      alert(`Could not remove item: ${err.message}`);
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
}