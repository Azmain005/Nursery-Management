import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../../../Auth/firebase.init";
import { AuthContext } from "../../../providers/AuthProvider";

const NurseryCartContext = createContext();
export const useNurseryCart = () => useContext(NurseryCartContext);

export function NurseryCartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }
    const q = query(
      collection(db, "nursery_cart"),
      where("workerId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) =>
      setCartItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [user]);

  const addToCart = async (material) => {
    await addDoc(collection(db, "nursery_cart"), {
      workerId: user.uid,
      materialId: material.id,
      name: material.name,
      price: material.price,
      image: material.image,
      quantity: 1,
      maxQuantity: material.quantity,
      description: material.description || "",
      addedAt: new Date().toISOString(),
    });
  };

  const removeFromCart = async (cartItem) => {
    const cartRef = doc(db, "nursery_cart", cartItem.id);
    const matRef = doc(db, "Material_for_sell", cartItem.materialId);
    try {
      await runTransaction(db, async (tx) => {
        // Restore stock in Material_for_sell
        const matSnap = await tx.get(matRef);
        const currentStock = matSnap.exists()
          ? matSnap.data().quantity || 0
          : 0;
        tx.update(matRef, {
          quantity: currentStock + cartItem.quantity,
        });
        tx.delete(cartRef);
      });
      setCartItems((items) => items.filter((i) => i.id !== cartItem.id));
    } catch (err) {
      console.error("Failed to remove from cart & restore stock:", err);
      alert(`Could not remove item: ${err.message}`);
    }
  };

  const updateQuantity = async (id, newQty) => {
    try {
      await updateDoc(doc(db, "nursery_cart", id), { quantity: newQty });
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Couldn't update quantity. Please try again.");
    }
  };

  // Clear all items from the cart
  const clearCart = async () => {
    if (!user || !cartItems.length) return;

    try {
      const batch = writeBatch(db);

      // Delete each cart item
      cartItems.forEach((item) => {
        const cartRef = doc(db, "nursery_cart", item.id);
        batch.delete(cartRef);
      });

      await batch.commit();

      // Clear local state
      setCartItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      alert("Failed to clear cart. Please try again.");
    }
  };

  return (
    <NurseryCartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </NurseryCartContext.Provider>
  );
}
