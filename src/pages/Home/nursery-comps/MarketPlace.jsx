// import {
//   collection,
//   doc,
//   getDoc,
//   getDocs,
//   increment,
//   onSnapshot,
//   serverTimestamp,
//   writeBatch,
// } from "firebase/firestore";
// import {
//   Check,
//   DollarSign,
//   MapPin,
//   Package,
//   TrendingUp,
//   User,
//   X,
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import {
//   Bar,
//   BarChart,
//   Cell,
//   Legend,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { db } from "../../../Auth/firebase.init";
// import Loader from "../../../components/Loader/Loader";

// const MarketPlace = () => {
//   const [orders, setOrders] = useState([]);
//   const [salesData, setSalesData] = useState(null);
//   const [totalOrderValue, setTotalOrderValue] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("orders");
//   const [error, setError] = useState(null);

//   // Colors from the requirements
//   const colors = {
//     background: "#faf6e9",
//     primary: "#3e5931",
//     text: "#02542d",
//     accent: "#6a994e",
//     lightAccent: "#a7c957",
//     chartColors: ["#3e5931", "#6a994e", "#a7c957", "#87b37a", "#c5d86d"],
//   };

//   useEffect(() => {
//     // Load orders and sales data
//     const loadData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Fetch cart data (orders)
//         const cartCollection = collection(db, "cart");
//         const cartSnapshot = await getDocs(cartCollection);

//         // Early exit if there are no orders
//         if (cartSnapshot.empty) {
//           setOrders([]);
//           setTotalOrderValue(0);
//           await fetchSalesData();
//           setLoading(false);
//           return;
//         }

//         // Process cart data and fetch related user data
//         const ordersPromises = cartSnapshot.docs.map(async (cartDoc) => {
//           try {
//             const cartData = cartDoc.data();

//             // Skip invalid entries
//             if (!cartData || !cartData.userId) {
//               console.warn("Skipping invalid cart entry:", cartDoc.id);
//               return null;
//             }

//             // Fetch user data using userId from cart
//             const userDocRef = doc(db, "user_data", cartData.userId);
//             const userDoc = await getDoc(userDocRef);

//             // Skip if user data doesn't exist
//             if (!userDoc.exists()) {
//               console.warn(
//                 `User data not found for user ID: ${cartData.userId}`
//               );
//               return null;
//             }

//             const userData = userDoc.data();

//             // Safety check for address
//             const address = userData.address || {};
//             const formattedAddress = address
//               ? `${address.street || ""}, ${address.city || ""}, ${
//                   address.state || ""
//                 }, ${address.country || ""}, ${address.zipCode || ""}`
//               : "Address not available";

//             // Safety check for product data
//             if (
//               !cartData.plantId ||
//               !cartData.name ||
//               !cartData.quantity ||
//               !cartData.price
//             ) {
//               console.warn(
//                 `Incomplete product data for cart ID: ${cartDoc.id}`
//               );
//               return null;
//             }

//             const price =
//               typeof cartData.price === "string"
//                 ? parseFloat(cartData.price)
//                 : typeof cartData.price === "number"
//                 ? cartData.price
//                 : 0;

//             return {
//               id: cartDoc.id,
//               userId: cartData.userId,
//               customerName: userData.displayName || "Unknown Customer",
//               email: userData.email || "No Email",
//               address: formattedAddress,
//               products: [
//                 {
//                   id: cartData.plantId || "unknown",
//                   name: cartData.name || "Unknown Product",
//                   quantity: Number(cartData.quantity) || 1,
//                   price: price,
//                   image: cartData.image || null,
//                 },
//               ],
//               totalAmount: price * (Number(cartData.quantity) || 1),
//               status: "pending",
//               timestamp: cartData.timestamp || null,
//             };
//           } catch (err) {
//             console.error(`Error processing order ${cartDoc.id}:`, err);
//             return null;
//           }
//         });

//         // Wait for all promises and filter out nulls (failed to process)
//         const ordersWithUserDetails = (
//           await Promise.all(ordersPromises)
//         ).filter((order) => order !== null);

//         // Sort orders by timestamp if available
//         const sortedOrders = ordersWithUserDetails.sort((a, b) => {
//           if (!a.timestamp && !b.timestamp) return 0;
//           if (!a.timestamp) return 1;
//           if (!b.timestamp) return -1;
//           return b.timestamp - a.timestamp;
//         });

//         setOrders(sortedOrders);

//         // Calculate total pending order value
//         const total = sortedOrders.reduce(
//           (sum, order) => sum + order.totalAmount,
//           0
//         );
//         setTotalOrderValue(total);

//         // Get sales data for charts
//         await fetchSalesData();

//         setLoading(false);
//       } catch (error) {
//         console.error("Error loading data:", error);
//         setError("Failed to load order data. Please try again.");
//         setLoading(false);
//       }
//     };

//     loadData();

//     // Set up a real-time listener for changes to the cart collection
//     const cartCollection = collection(db, "cart");
//     const unsubscribe = onSnapshot(
//       cartCollection,
//       (snapshot) => {
//         // If any changes occur to the cart collection, reload data
//         loadData();
//       },
//       (err) => {
//         console.error("Error in cart snapshot listener:", err);
//         setError(
//           "Failed to listen for order updates. Please refresh the page."
//         );
//       }
//     );

//     // Clean up the listener when component unmounts
//     return () => unsubscribe();
//   }, []);

//   // Function to fetch sales data from Firebase
//   const fetchSalesData = async () => {
//     try {
//       // Get sales summary document
//       const salesSummaryRef = doc(db, "sales_summary", "statistics");
//       const salesSummaryDoc = await getDoc(salesSummaryRef);

//       let summaryData = { totalRevenue: 0, totalOrders: 0 };
//       if (salesSummaryDoc.exists()) {
//         const docData = salesSummaryDoc.data();
//         summaryData = {
//           totalRevenue:
//             typeof docData.totalRevenue === "number" ? docData.totalRevenue : 0,
//           totalOrders:
//             typeof docData.totalOrders === "number" ? docData.totalOrders : 0,
//         };
//       }

//       // Get product sales data
//       const productSalesCollection = collection(db, "product_sales");
//       const productSalesSnapshot = await getDocs(productSalesCollection);

//       const productSalesData = productSalesSnapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           name: data.name || "Unknown Product",
//           sold: typeof data.quantitySold === "number" ? data.quantitySold : 0,
//           revenue: typeof data.revenue === "number" ? data.revenue : 0,
//         };
//       });

//       setSalesData({
//         totalRevenue: summaryData.totalRevenue,
//         totalOrders: summaryData.totalOrders,
//         productSales: productSalesData,
//       });
//     } catch (error) {
//       console.error("Error fetching sales data:", error);
//       // Don't set error state here, as it would override the main error state
//       // Just set default sales data so the UI can still render
//       setSalesData({
//         totalRevenue: 0,
//         totalOrders: 0,
//         productSales: [],
//       });
//     }
//   };

//   const handleConfirmOrder = async (order) => {
//     try {
//       const batch = writeBatch(db);

//       // Remove the order from the cart collection
//       const cartRef = doc(db, "cart", order.id);
//       batch.delete(cartRef);

//       // Update the sales_summary document (create if it doesn't exist)
//       const salesSummaryRef = doc(db, "sales_summary", "statistics");
//       const salesSummaryDoc = await getDoc(salesSummaryRef);

//       if (salesSummaryDoc.exists()) {
//         batch.update(salesSummaryRef, {
//           totalRevenue: increment(order.totalAmount),
//           totalOrders: increment(1),
//           lastUpdated: serverTimestamp(),
//         });
//       } else {
//         batch.set(salesSummaryRef, {
//           totalRevenue: order.totalAmount,
//           totalOrders: 1,
//           lastUpdated: serverTimestamp(),
//         });
//       }

//       // Update product sales for the product in the order
//       const product = order.products[0]; // Since we have single product per cart item
//       if (product && product.id) {
//         const productSalesRef = doc(db, "product_sales", product.id);
//         const productDoc = await getDoc(productSalesRef);

//         if (productDoc.exists()) {
//           // Update existing product sales record
//           batch.update(productSalesRef, {
//             quantitySold: increment(product.quantity),
//             revenue: increment(product.price * product.quantity),
//             lastUpdated: serverTimestamp(),
//           });
//         } else {
//           // Create new product sales record
//           batch.set(productSalesRef, {
//             name: product.name,
//             quantitySold: product.quantity,
//             revenue: product.price * product.quantity,
//             lastUpdated: serverTimestamp(),
//           });
//         }

//         // Add product to inventory if needed
//         const inventoryRef = doc(db, "inventory", product.id);
//         const inventoryDoc = await getDoc(inventoryRef);

//         if (!inventoryDoc.exists()) {
//           batch.set(inventoryRef, {
//             name: product.name,
//             quantity: 0,
//             price: product.price,
//             image: product.image,
//             lastUpdated: serverTimestamp(),
//           });
//         }
//       }

//       // Commit all the batch operations
//       await batch.commit();

//       // Update local state
//       setOrders(orders.filter((o) => o.id !== order.id));
//       setTotalOrderValue((prev) => prev - order.totalAmount);

//       // Refresh sales data
//       await fetchSalesData();

//       alert(`Order from ${order.customerName} has been confirmed!`);
//     } catch (error) {
//       console.error("Error confirming order:", error);
//       alert("Failed to confirm order. Please try again.");
//     }
//   };

//   const handleCancelOrder = async (order) => {
//     try {
//       const batch = writeBatch(db);

//       // Add products back to inventory
//       const product = order.products[0]; // Since we have single product per cart item
//       if (product && product.id) {
//         const inventoryRef = doc(db, "inventory", product.id);
//         const inventoryDoc = await getDoc(inventoryRef);

//         if (inventoryDoc.exists()) {
//           batch.update(inventoryRef, {
//             quantity: increment(product.quantity),
//             lastUpdated: serverTimestamp(),
//           });
//         } else {
//           batch.set(inventoryRef, {
//             name: product.name,
//             quantity: product.quantity,
//             price: product.price,
//             image: product.image,
//             lastUpdated: serverTimestamp(),
//           });
//         }
//       }

//       // Remove the order from the cart collection
//       const cartRef = doc(db, "cart", order.id);
//       batch.delete(cartRef);

//       // Commit all the batch operations
//       await batch.commit();

//       // Update local state
//       setOrders(orders.filter((o) => o.id !== order.id));
//       setTotalOrderValue((prev) => prev - order.totalAmount);

//       alert(
//         `Order from ${order.customerName} has been cancelled and inventory has been restored.`
//       );
//     } catch (error) {
//       console.error("Error cancelling order:", error);
//       alert("Failed to cancel order. Please try again.");
//     }
//   };

//   const formatCurrency = (value) => {
//     return value?.toFixed(2) || "0.00";
//   };

//   if (loading) {
//     return (
//       // <div className="flex items-center justify-center h-screen" style={{ backgroundColor: colors.background }}>
//       //   <div className="text-xl font-semibold" style={{ color: colors.text }}>Loading...</div>
//       // </div>
//       <Loader></Loader>
//     );
//   }

//   if (error) {
//     return (
//       <div
//         className="flex items-center justify-center h-screen"
//         style={{ backgroundColor: colors.background }}
//       >
//         <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
//           <div className="text-red-600 mb-4 text-5xl">⚠️</div>
//           <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
//             Error
//           </h2>
//           <p className="mb-6" style={{ color: colors.text }}>
//             {error}
//           </p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 rounded text-white font-medium"
//             style={{ backgroundColor: colors.primary }}
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="min-h-screen"
//       style={{ backgroundColor: colors.background, color: colors.text }}
//     >
//       <div className="container mx-auto px-4 py-8">
//         <h1
//           className="text-4xl font-bold mb-6 text-center"
//           style={{ color: colors.primary }}
//         >
//           Plant Marketplace Dashboard
//         </h1>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
//             <div
//               className="p-3 rounded-full mr-4"
//               style={{ backgroundColor: colors.lightAccent }}
//             >
//               <Package size={24} style={{ color: colors.primary }} />
//             </div>
//             <div>
//               <p className="text-sm font-medium opacity-70">Pending Orders</p>
//               <p className="text-2xl font-bold">{orders.length}</p>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
//             <div
//               className="p-3 rounded-full mr-4"
//               style={{ backgroundColor: colors.lightAccent }}
//             >
//               <DollarSign size={24} style={{ color: colors.primary }} />
//             </div>
//             <div>
//               <p className="text-sm font-medium opacity-70">
//                 Pending Orders Value
//               </p>
//               <p className="text-2xl font-bold">
//                 ${formatCurrency(totalOrderValue)}
//               </p>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
//             <div
//               className="p-3 rounded-full mr-4"
//               style={{ backgroundColor: colors.lightAccent }}
//             >
//               <TrendingUp size={24} style={{ color: colors.primary }} />
//             </div>
//             <div>
//               <p className="text-sm font-medium opacity-70">Total Sales</p>
//               <p className="text-2xl font-bold">
//                 ${formatCurrency(salesData?.totalRevenue)}
//               </p>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
//             <div
//               className="p-3 rounded-full mr-4"
//               style={{ backgroundColor: colors.lightAccent }}
//             >
//               <Package size={24} style={{ color: colors.primary }} />
//             </div>
//             <div>
//               <p className="text-sm font-medium opacity-70">Completed Orders</p>
//               <p className="text-2xl font-bold">
//                 {salesData?.totalOrders || 0}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex border-b mb-6">
//           <button
//             className={`py-2 px-4 font-medium ${
//               activeTab === "orders" ? "border-b-2" : ""
//             }`}
//             style={{
//               borderColor:
//                 activeTab === "orders" ? colors.primary : "transparent",
//               color: activeTab === "orders" ? colors.primary : colors.text,
//             }}
//             onClick={() => setActiveTab("orders")}
//           >
//             Pending Orders
//           </button>
//           <button
//             className={`py-2 px-4 font-medium ${
//               activeTab === "analytics" ? "border-b-2" : ""
//             }`}
//             style={{
//               borderColor:
//                 activeTab === "analytics" ? colors.primary : "transparent",
//               color: activeTab === "analytics" ? colors.primary : colors.text,
//             }}
//             onClick={() => setActiveTab("analytics")}
//           >
//             Sales Analytics
//           </button>
//         </div>

//         {activeTab === "orders" && (
//           <div>
//             <h2
//               className="text-2xl font-semibold mb-4"
//               style={{ color: colors.primary }}
//             >
//               Pending Orders
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {orders.length > 0 ? (
//                 orders.map((order) => (
//                   <div
//                     key={order.id}
//                     className="bg-white rounded-lg shadow-md overflow-hidden"
//                   >
//                     <div
//                       className="p-5"
//                       style={{
//                         borderBottom: `2px solid ${colors.lightAccent}`,
//                       }}
//                     >
//                       <div className="flex items-center mb-3">
//                         <User
//                           size={20}
//                           className="mr-2"
//                           style={{ color: colors.primary }}
//                         />
//                         <h3 className="font-semibold text-lg">
//                           {order.customerName}
//                         </h3>
//                       </div>
//                       <div className="flex items-start mb-3">
//                         <MapPin
//                           size={20}
//                           className="mr-2 mt-1 flex-shrink-0"
//                           style={{ color: colors.primary }}
//                         />
//                         <p className="text-sm opacity-80">{order.address}</p>
//                       </div>

//                       <div className="mt-4">
//                         <p className="font-medium mb-2">Ordered Items:</p>
//                         <ul className="space-y-1">
//                           {order.products.map((product, idx) => (
//                             <li
//                               key={idx}
//                               className="flex justify-between text-sm"
//                             >
//                               <div className="flex items-center">
//                                 {product.image && (
//                                   <img
//                                     src={product.image}
//                                     alt={product.name}
//                                     className="w-8 h-8 rounded-full mr-2 object-cover"
//                                   />
//                                 )}
//                                 <span>
//                                   {product.name} × {product.quantity}
//                                 </span>
//                               </div>
//                               <span>
//                                 $
//                                 {formatCurrency(
//                                   product.price * product.quantity
//                                 )}
//                               </span>
//                             </li>
//                           ))}
//                         </ul>
//                         <div className="mt-3 pt-2 border-t flex justify-between font-bold">
//                           <span>Total</span>
//                           <span>${formatCurrency(order.totalAmount)}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="p-4 flex justify-between">
//                       <button
//                         onClick={() => handleCancelOrder(order)}
//                         className="px-4 py-2 rounded-md flex items-center font-medium"
//                         style={{ backgroundColor: "#f8d7da", color: "#721c24" }}
//                       >
//                         <X size={18} className="mr-1" />
//                         Cancel
//                       </button>
//                       <button
//                         onClick={() => handleConfirmOrder(order)}
//                         className="px-4 py-2 rounded-md flex items-center font-medium text-white"
//                         style={{ backgroundColor: colors.primary }}
//                       >
//                         <Check size={18} className="mr-1" />
//                         Confirm
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="col-span-3 text-center py-10">
//                   <p className="text-lg opacity-70">
//                     No pending orders at the moment.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {activeTab === "analytics" && salesData && (
//           <div>
//             <h2
//               className="text-2xl font-semibold mb-6"
//               style={{ color: colors.primary }}
//             >
//               Sales Analytics
//             </h2>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {/* Product Sales Chart */}
//               <div className="bg-white p-6 rounded-lg shadow-md">
//                 <h3
//                   className="text-lg font-medium mb-4"
//                   style={{ color: colors.primary }}
//                 >
//                   Product Sales Distribution
//                 </h3>
//                 <div className="h-64">
//                   {salesData.productSales.length > 0 ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={salesData.productSales}
//                           dataKey="sold"
//                           nameKey="name"
//                           cx="50%"
//                           cy="50%"
//                           outerRadius={80}
//                           label={(entry) => entry.name}
//                         >
//                           {salesData.productSales.map((entry, index) => (
//                             <Cell
//                               key={`cell-${index}`}
//                               fill={
//                                 colors.chartColors[
//                                   index % colors.chartColors.length
//                                 ]
//                               }
//                             />
//                           ))}
//                         </Pie>
//                         <Tooltip
//                           formatter={(value) => [`${value} units`, "Sold"]}
//                         />
//                         <Legend />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div className="h-full flex items-center justify-center">
//                       <p className="text-gray-500">
//                         No product sales data available
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Revenue By Product Chart */}
//               <div className="bg-white p-6 rounded-lg shadow-md">
//                 <h3
//                   className="text-lg font-medium mb-4"
//                   style={{ color: colors.primary }}
//                 >
//                   Revenue by Product
//                 </h3>
//                 <div className="h-64">
//                   {salesData.productSales.length > 0 ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart
//                         data={salesData.productSales}
//                         margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                       >
//                         <XAxis dataKey="name" />
//                         <YAxis />
//                         <Tooltip
//                           formatter={(value) => [
//                             `$${formatCurrency(value)}`,
//                             "Revenue",
//                           ]}
//                         />
//                         <Legend />
//                         <Bar
//                           dataKey="revenue"
//                           fill={colors.primary}
//                           name="Revenue ($)"
//                         />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div className="h-full flex items-center justify-center">
//                       <p className="text-gray-500">No revenue data available</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Best Selling Products Table */}
//               <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
//                 <h3
//                   className="text-lg font-medium mb-4"
//                   style={{ color: colors.primary }}
//                 >
//                   Sales Performance by Product
//                 </h3>
//                 {salesData.productSales.length > 0 ? (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full">
//                       <thead>
//                         <tr style={{ backgroundColor: colors.lightAccent }}>
//                           <th className="py-3 px-4 text-left">Product</th>
//                           <th className="py-3 px-4 text-right">Units Sold</th>
//                           <th className="py-3 px-4 text-right">Revenue</th>
//                           <th className="py-3 px-4 text-right">
//                             % of Total Sales
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {salesData.productSales
//                           .sort((a, b) => b.revenue - a.revenue)
//                           .map((product, idx) => (
//                             <tr
//                               key={idx}
//                               className={
//                                 idx % 2 === 0 ? "bg-gray-50" : "bg-white"
//                               }
//                             >
//                               <td className="py-3 px-4 font-medium">
//                                 {product.name}
//                               </td>
//                               <td className="py-3 px-4 text-right">
//                                 {product.sold} units
//                               </td>
//                               <td className="py-3 px-4 text-right">
//                                 ${formatCurrency(product.revenue)}
//                               </td>
//                               <td className="py-3 px-4 text-right">
//                                 {salesData.totalRevenue > 0
//                                   ? (
//                                       (product.revenue /
//                                         salesData.totalRevenue) *
//                                       100
//                                     ).toFixed(1)
//                                   : "0.0"}
//                                 %
//                               </td>
//                             </tr>
//                           ))}
//                       </tbody>
//                       <tfoot>
//                         <tr style={{ backgroundColor: colors.background }}>
//                           <td className="py-3 px-4 font-bold">Total</td>
//                           <td className="py-3 px-4 text-right font-bold">
//                             {salesData.productSales.reduce(
//                               (sum, item) => sum + item.sold,
//                               0
//                             )}{" "}
//                             units
//                           </td>
//                           <td className="py-3 px-4 text-right font-bold">
//                             ${formatCurrency(salesData.totalRevenue)}
//                           </td>
//                           <td className="py-3 px-4 text-right font-bold">
//                             100%
//                           </td>
//                         </tr>
//                       </tfoot>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <p className="text-gray-500">
//                       No sales performance data available
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MarketPlace;

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  Check,
  DollarSign,
  MapPin,
  Package,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "../../../Auth/firebase.init";
import Loader from "../../../components/Loader/Loader";

const MarketPlace = () => {
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
    // Load orders and sales data
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from ordered collection
        const orderedCollection = collection(db, "ordered");
        const orderedSnapshot = await getDocs(orderedCollection);

        // Early exit if there are no orders
        if (orderedSnapshot.empty) {
          setOrders([]);
          setTotalOrderValue(0);
          await fetchSalesData();
          setLoading(false);
          return;
        }

        // Process ordered data and fetch related user data
        const ordersPromises = orderedSnapshot.docs.map(async (orderDoc) => {
          try {
            const orderData = orderDoc.data();

            // Skip invalid entries
            if (!orderData || !orderData.userId || !orderData.items || !orderData.items.length) {
              console.warn("Skipping invalid order entry:", orderDoc.id);
              return null;
            }

            // Fetch user data using userId from order
            const userDocRef = doc(db, "user_data", orderData.userId);
            const userDoc = await getDoc(userDocRef);

            // Skip if user data doesn't exist
            if (!userDoc.exists()) {
              console.warn(`User data not found for user ID: ${orderData.userId}`);
              return null;
            }

            const userData = userDoc.data();

            // Safety check for address
            const address = userData.address || {};
            const formattedAddress = address
              ? `${address.street || ""}, ${address.city || ""}, ${
                  address.state || ""
                }, ${address.country || ""}, ${address.zipCode || ""}`
              : "Address not available";

            // Process each item in the order
            const products = orderData.items.map(item => {
              const price = typeof item.unitPrice === 'string' 
                ? parseFloat(item.unitPrice) 
                : typeof item.unitPrice === 'number' 
                  ? item.unitPrice 
                  : 0;

              return {
                id: item.plantId || item.productId || "unknown",
                name: item.name || "Unknown Product",
                quantity: Number(item.quantity) || 1,
                price: price,
                image: item.image || null,
              };
            });

            // Calculate total amount for the order
            const totalAmount = products.reduce(
              (sum, product) => sum + (product.price * product.quantity),
              0
            );

            return {
              id: orderDoc.id,
              userId: orderData.userId,
              customerName: userData.displayName || "Unknown Customer",
              email: userData.email || "No Email",
              address: formattedAddress,
              products: products,
              totalAmount: totalAmount,
              status: "pending",
              timestamp: orderData.timestamp || null,
            };
          } catch (err) {
            console.error(`Error processing order ${orderDoc.id}:`, err);
            return null;
          }
        });

        // Wait for all promises and filter out nulls (failed to process)
        const ordersWithUserDetails = (
          await Promise.all(ordersPromises)
        ).filter((order) => order !== null);

        // Sort orders by timestamp if available
        const sortedOrders = ordersWithUserDetails.sort((a, b) => {
          if (!a.timestamp && !b.timestamp) return 0;
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return b.timestamp - a.timestamp;
        });

        setOrders(sortedOrders);

        // Calculate total pending order value
        const total = sortedOrders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        );
        setTotalOrderValue(total);

        // Get sales data for charts
        await fetchSalesData();

        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load order data. Please try again.");
        setLoading(false);
      }
    };

    loadData();

    // Set up a real-time listener for changes to the ordered collection
    const orderedCollection = collection(db, "ordered");
    const unsubscribe = onSnapshot(
      orderedCollection,
      (snapshot) => {
        // If any changes occur to the ordered collection, reload data
        loadData();
      },
      (err) => {
        console.error("Error in ordered snapshot listener:", err);
        setError(
          "Failed to listen for order updates. Please refresh the page."
        );
      }
    );

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Function to fetch sales data from Firebase
  const fetchSalesData = async () => {
    try {
      // Get sales summary document
      const salesSummaryRef = doc(db, "sales_summary", "statistics");
      const salesSummaryDoc = await getDoc(salesSummaryRef);

      let summaryData = { totalRevenue: 0, totalOrders: 0 };
      if (salesSummaryDoc.exists()) {
        const docData = salesSummaryDoc.data();
        summaryData = {
          totalRevenue:
            typeof docData.totalRevenue === "number" ? docData.totalRevenue : 0,
          totalOrders:
            typeof docData.totalOrders === "number" ? docData.totalOrders : 0,
        };
      }

      // Get product sales data
      const productSalesCollection = collection(db, "product_sales");
      const productSalesSnapshot = await getDocs(productSalesCollection);

      const productSalesData = productSalesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name || "Unknown Product",
          sold: typeof data.quantitySold === "number" ? data.quantitySold : 0,
          revenue: typeof data.revenue === "number" ? data.revenue : 0,
        };
      });

      setSalesData({
        totalRevenue: summaryData.totalRevenue,
        totalOrders: summaryData.totalOrders,
        productSales: productSalesData,
      });
    } catch (error) {
      console.error("Error fetching sales data:", error);
      // Don't set error state here, as it would override the main error state
      // Just set default sales data so the UI can still render
      setSalesData({
        totalRevenue: 0,
        totalOrders: 0,
        productSales: [],
      });
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      const batch = writeBatch(db);

      // Add the order to the confirmed collection
      const confirmedRef = doc(db, "confirmed", order.id);
      batch.set(confirmedRef, {
        userId: order.userId,
        items: order.products.map(product => ({
          productId: product.id,
          name: product.name,
          quantity: product.quantity,
          unitPrice: product.price,
          image: product.image,
        })),
        totalAmount: order.totalAmount,
        customerName: order.customerName,
        email: order.email,
        address: order.address,
        status: "confirmed",
        confirmedAt: serverTimestamp(),
        originalOrderId: order.id,
      });

      // Update sales summary
      const salesSummaryRef = doc(db, "sales_summary", "statistics");
      const salesSummaryDoc = await getDoc(salesSummaryRef);

      if (salesSummaryDoc.exists()) {
        batch.update(salesSummaryRef, {
          totalRevenue: increment(order.totalAmount),
          totalOrders: increment(1),
          lastUpdated: serverTimestamp(),
        });
      } else {
        batch.set(salesSummaryRef, {
          totalRevenue: order.totalAmount,
          totalOrders: 1,
          lastUpdated: serverTimestamp(),
        });
      }

      // Update product sales for each product in the order
      for (const product of order.products) {
        if (product.id) {
          const productSalesRef = doc(db, "product_sales", product.id);
          const productDoc = await getDoc(productSalesRef);

          if (productDoc.exists()) {
            batch.update(productSalesRef, {
              quantitySold: increment(product.quantity),
              revenue: increment(product.price * product.quantity),
              lastUpdated: serverTimestamp(),
            });
          } else {
            batch.set(productSalesRef, {
              name: product.name,
              quantitySold: product.quantity,
              revenue: product.price * product.quantity,
              lastUpdated: serverTimestamp(),
            });
          }

          // Update inventory
          const inventoryRef = doc(db, "inventory", product.id);
          const inventoryDoc = await getDoc(inventoryRef);

          if (!inventoryDoc.exists()) {
            batch.set(inventoryRef, {
              name: product.name,
              quantity: 0,
              price: product.price,
              image: product.image,
              lastUpdated: serverTimestamp(),
            });
          }
        }
      }

      // Remove from ordered collection
      const orderedRef = doc(db, "ordered", order.id);
      batch.delete(orderedRef);

      await batch.commit();

      // Update local state
      setOrders(orders.filter((o) => o.id !== order.id));
      setTotalOrderValue((prev) => prev - order.totalAmount);
      await fetchSalesData();

      alert(`Order from ${order.customerName} has been confirmed!`);
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Failed to confirm order. Please try again.");
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      const batch = writeBatch(db);

      // Add products back to inventory
      for (const product of order.products) {
        if (product.id) {
          const inventoryRef = doc(db, "inventory", product.id);
          const inventoryDoc = await getDoc(inventoryRef);

          if (inventoryDoc.exists()) {
            batch.update(inventoryRef, {
              quantity: increment(product.quantity),
              lastUpdated: serverTimestamp(),
            });
          } else {
            batch.set(inventoryRef, {
              name: product.name,
              quantity: product.quantity,
              price: product.price,
              image: product.image,
              lastUpdated: serverTimestamp(),
            });
          }
        }
      }

      // Remove the order from the ordered collection
      const orderedRef = doc(db, "ordered", order.id);
      batch.delete(orderedRef);

      await batch.commit();

      // Update local state
      setOrders(orders.filter((o) => o.id !== order.id));
      setTotalOrderValue((prev) => prev - order.totalAmount);

      alert(
        `Order from ${order.customerName} has been cancelled and inventory has been restored.`
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const formatCurrency = (value) => {
    return value?.toFixed(2) || "0.00";
  };

  if (loading) {
    return <Loader></Loader>;
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 mb-4 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
            Error
          </h2>
          <p className="mb-6" style={{ color: colors.text }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded text-white font-medium"
            style={{ backgroundColor: colors.primary }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <div className="container mx-auto px-4 py-8">
        <h1
          className="text-4xl font-bold mb-6 text-center"
          style={{ color: colors.primary }}
        >
          Plant Marketplace Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div
              className="p-3 rounded-full mr-4"
              style={{ backgroundColor: colors.lightAccent }}
            >
              <Package size={24} style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-sm font-medium opacity-70">Pending Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div
              className="p-3 rounded-full mr-4"
              style={{ backgroundColor: colors.lightAccent }}
            >
              <DollarSign size={24} style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-sm font-medium opacity-70">
                Pending Orders Value
              </p>
              <p className="text-2xl font-bold">
                ${formatCurrency(totalOrderValue)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div
              className="p-3 rounded-full mr-4"
              style={{ backgroundColor: colors.lightAccent }}
            >
              <TrendingUp size={24} style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-sm font-medium opacity-70">Total Sales</p>
              <p className="text-2xl font-bold">
                ${formatCurrency(salesData?.totalRevenue)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div
              className="p-3 rounded-full mr-4"
              style={{ backgroundColor: colors.lightAccent }}
            >
              <Package size={24} style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-sm font-medium opacity-70">Completed Orders</p>
              <p className="text-2xl font-bold">
                {salesData?.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "orders" ? "border-b-2" : ""
            }`}
            style={{
              borderColor:
                activeTab === "orders" ? colors.primary : "transparent",
              color: activeTab === "orders" ? colors.primary : colors.text,
            }}
            onClick={() => setActiveTab("orders")}
          >
            Pending Orders
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "analytics" ? "border-b-2" : ""
            }`}
            style={{
              borderColor:
                activeTab === "analytics" ? colors.primary : "transparent",
              color: activeTab === "analytics" ? colors.primary : colors.text,
            }}
            onClick={() => setActiveTab("analytics")}
          >
            Sales Analytics
          </button>
        </div>

        {activeTab === "orders" && (
          <div>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: colors.primary }}
            >
              Pending Orders
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div
                      className="p-5"
                      style={{
                        borderBottom: `2px solid ${colors.lightAccent}`,
                      }}
                    >
                      <div className="flex items-center mb-3">
                        <User
                          size={20}
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        <h3 className="font-semibold text-lg">
                          {order.customerName}
                        </h3>
                      </div>
                      <div className="flex items-start mb-3">
                        <MapPin
                          size={20}
                          className="mr-2 mt-1 flex-shrink-0"
                          style={{ color: colors.primary }}
                        />
                        <p className="text-sm opacity-80">{order.address}</p>
                      </div>

                      <div className="mt-4">
                        <p className="font-medium mb-2">Ordered Items:</p>
                        <ul className="space-y-1">
                          {order.products.map((product, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between text-sm"
                            >
                              <div className="flex items-center">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-8 h-8 rounded-full mr-2 object-cover"
                                  />
                                )}
                                <span>
                                  {product.name} × {product.quantity}
                                </span>
                              </div>
                              <span>
                                $
                                {formatCurrency(
                                  product.price * product.quantity
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 pt-2 border-t flex justify-between font-bold">
                          <span>Total</span>
                          <span>${formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex justify-between">
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="px-4 py-2 rounded-md flex items-center font-medium"
                        style={{ backgroundColor: "#f8d7da", color: "#721c24" }}
                      >
                        <X size={18} className="mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmOrder(order)}
                        className="px-4 py-2 rounded-md flex items-center font-medium text-white"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Check size={18} className="mr-1" />
                        Confirm
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-lg opacity-70">
                    No pending orders at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && salesData && (
          <div>
            <h2
              className="text-2xl font-semibold mb-6"
              style={{ color: colors.primary }}
            >
              Sales Analytics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Sales Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3
                  className="text-lg font-medium mb-4"
                  style={{ color: colors.primary }}
                >
                  Product Sales Distribution
                </h3>
                <div className="h-64">
                  {salesData.productSales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesData.productSales}
                          dataKey="sold"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => entry.name}
                        >
                          {salesData.productSales.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                colors.chartColors[
                                  index % colors.chartColors.length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} units`, "Sold"]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">
                        No product sales data available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue By Product Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3
                  className="text-lg font-medium mb-4"
                  style={{ color: colors.primary }}
                >
                  Revenue by Product
                </h3>
                <div className="h-64">
                  {salesData.productSales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesData.productSales}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [
                            `$${formatCurrency(value)}`,
                            "Revenue",
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="revenue"
                          fill={colors.primary}
                          name="Revenue ($)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No revenue data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Best Selling Products Table */}
              <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                <h3
                  className="text-lg font-medium mb-4"
                  style={{ color: colors.primary }}
                >
                  Sales Performance by Product
                </h3>
                {salesData.productSales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr style={{ backgroundColor: colors.lightAccent }}>
                          <th className="py-3 px-4 text-left">Product</th>
                          <th className="py-3 px-4 text-right">Units Sold</th>
                          <th className="py-3 px-4 text-right">Revenue</th>
                          <th className="py-3 px-4 text-right">
                            % of Total Sales
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.productSales
                          .sort((a, b) => b.revenue - a.revenue)
                          .map((product, idx) => (
                            <tr
                              key={idx}
                              className={
                                idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                              }
                            >
                              <td className="py-3 px-4 font-medium">
                                {product.name}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {product.sold} units
                              </td>
                              <td className="py-3 px-4 text-right">
                                ${formatCurrency(product.revenue)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {salesData.totalRevenue > 0
                                  ? (
                                      (product.revenue /
                                        salesData.totalRevenue) *
                                      100
                                    ).toFixed(1)
                                  : "0.0"}
                                %
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: colors.background }}>
                          <td className="py-3 px-4 font-bold">Total</td>
                          <td className="py-3 px-4 text-right font-bold">
                            {salesData.productSales.reduce(
                              (sum, item) => sum + item.sold,
                              0
                            )}{" "}
                            units
                          </td>
                          <td className="py-3 px-4 text-right font-bold">
                            ${formatCurrency(salesData.totalRevenue)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold">
                            100%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No sales performance data available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPlace;