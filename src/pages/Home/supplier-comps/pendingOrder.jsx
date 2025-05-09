import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";

const PendingOrder = () => {
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState(null);
  const [totalOrderValue, setTotalOrderValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [error, setError] = useState(null);

  // Colors from the requirements
  const colors = {
    background: "#faf6e9",
    primary: "#3e5931",
    text: "#02542d",
    accent: "#6a994e",
    lightAccent: "#a7c957",
    chartColors: ["#3e5931", "#6a994e", "#a7c957", "#87b37a", "#c5d86d"],
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const cartSnapshot = await getDocs(collection(db, "nursery_cart"));
        const ordersData = cartSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);

        const salesSnapshot = await getDocs(collection(db, "Supplier_Sales"));
        const sales = salesSnapshot.docs.map((doc) => doc.data());
        setSalesData(sales);

        const totalValue = ordersData.reduce((sum, order) => sum + order.price, 0);
        setTotalOrderValue(totalValue);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleConfirmOrder = async (order) => {
    try {
      const orderRef = doc(db, "nursery_cart", order.id);
      await updateDoc(orderRef, { status: "confirmed" });
      alert("Order confirmed successfully!");
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id));
    } catch (err) {
      console.error("Error confirming order:", err);
      alert("Failed to confirm order. Please try again.");
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      const orderRef = doc(db, "nursery_cart", order.id);
      await deleteDoc(orderRef);
      alert("Order canceled successfully!");
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id));
    } catch (err) {
      console.error("Error canceling order:", err);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ backgroundColor: colors.background, minHeight: "100vh" }}>
      <div className="tabs">
        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={activeTab === "sales" ? "active" : ""}
          onClick={() => setActiveTab("sales")}
        >
          Sales
        </button>
      </div>

      {activeTab === "orders" && (
        <div>
          <h1>Pending Orders</h1>
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                <p>{order.name}</p>
                <p>{formatCurrency(order.price)}</p>
                <button onClick={() => handleConfirmOrder(order)}>Confirm</button>
                <button onClick={() => handleCancelOrder(order)}>Cancel</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "sales" && (
        <div>
          <h1>Sales Data</h1>
          <ul>
            {salesData &&
              salesData.map((sale, index) => (
                <li key={index}>
                  <p>{sale.name}</p>
                  <p>{formatCurrency(sale.total)}</p>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div>Total Order Value: {formatCurrency(totalOrderValue)}</div>
    </div>
  );
};

export default PendingOrder;