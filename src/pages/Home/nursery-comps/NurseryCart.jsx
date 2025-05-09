import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import { IoMdClose } from "react-icons/io";
import EmptyCartImage from "../../../assets/empty-cart.png";

const NurseryCart = () => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "nursery_cart"));
        const items = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => item.userId === user.uid);
        setCartItems(items);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [user]);

  const handleRemoveFromCart = async (itemId) => {
    try {
      await deleteDoc(doc(db, "nursery_cart", itemId));
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-6">Nursery Cart</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src={EmptyCartImage}
            alt="Empty Cart"
            className="w-48 h-48 mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-600">
            Your cart is empty
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="border p-4 rounded-lg shadow-md bg-white flex flex-col"
            >
              <img
                src={item.image || "https://via.placeholder.com/150"}
                alt={item.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="text-lg font-semibold text-[#2c5c2c] mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">Price: ${item.price}</p>
              <button
                onClick={() => handleRemoveFromCart(item.id)}
                className="mt-auto bg-red-500 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2"
              >
                Remove <IoMdClose />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NurseryCart;
