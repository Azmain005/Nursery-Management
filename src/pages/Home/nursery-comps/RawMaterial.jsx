import { 
  collection, 
  getDocs, 
  query, 
  doc, 
  updateDoc, 
  deleteDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../Auth/firebase.init";
import LoaderPlant from "../../../components/Loader/LoaderPlant";
import { IoIosSearch } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

const RawMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [updateQuantity, setUpdateQuantity] = useState({});
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [materialToDiscard, setMaterialToDiscard] = useState(null);
  const materialsPerPage = 6;

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      // Fetch materials directly from supplier_confirmed_orders
      const ordersQuery = query(collection(db, "supplier_confirmed_orders"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const confirmedOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Initialize quantity state for each material
      const initialQuantityState = {};
      confirmedOrders.forEach(order => {
        initialQuantityState[order.id] = order.materialInfo?.quantity || 0;
      });
      setUpdateQuantity(initialQuantityState);

      setMaterials(confirmedOrders);
      setFilteredMaterials(confirmedOrders);
    } catch (error) {
      console.error("Error fetching materials:", error);
      alert("Failed to load materials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = materials.filter((material) =>
      material.materialInfo?.name?.toLowerCase().includes(term)
    );
    setFilteredMaterials(filtered);
    setCurrentPage(1); // Reset to the first page after search
  };

  const handleSearchClick = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchTerm("");
      setFilteredMaterials(materials);
    }
  };

  const handleQuantityChange = (materialId, change) => {
    setUpdateQuantity(prev => {
      const currentQuantity = prev[materialId] || 0;
      // Ensure quantity doesn't go below 0
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [materialId]: newQuantity };
    });
  };

  const handleUpdateQuantity = async (materialId, originalQuantity) => {
    if (processing) return;
    
    setProcessing(true);
    try {
      const newQuantity = updateQuantity[materialId] || 0;
      
      if (newQuantity === 0) {
        // If quantity is 0, discard the material
        await deleteDoc(doc(db, "supplier_confirmed_orders", materialId));
        
        // Update state
        setMaterials(prev => prev.filter(material => material.id !== materialId));
        setFilteredMaterials(prev => prev.filter(material => material.id !== materialId));
        
        alert("Material removed successfully");
      } else if (newQuantity !== originalQuantity) {
        // Update quantity in supplier_confirmed_orders
        const materialRef = doc(db, "supplier_confirmed_orders", materialId);
        await updateDoc(materialRef, { 
          "materialInfo.quantity": newQuantity 
        });
        
        // Update state
        setMaterials(prev => 
          prev.map(material => 
            material.id === materialId 
              ? { 
                  ...material, 
                  materialInfo: { 
                    ...material.materialInfo, 
                    quantity: newQuantity 
                  } 
                } 
              : material
          )
        );
        setFilteredMaterials(prev => 
          prev.map(material => 
            material.id === materialId 
              ? { 
                  ...material, 
                  materialInfo: { 
                    ...material.materialInfo, 
                    quantity: newQuantity 
                  } 
                } 
              : material
          )
        );
        
        alert("Quantity updated successfully");
      } else {
        alert("No changes made");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  
  const openDiscardModal = (materialId) => {
    setMaterialToDiscard(materialId);
    setShowConfirmModal(true);
  };

  const handleDiscard = async () => {
    if (processing || !materialToDiscard) return;
    
    setProcessing(true);
    try {
      // Delete directly from supplier_confirmed_orders
      const materialRef = doc(db, "supplier_confirmed_orders", materialToDiscard);
      await deleteDoc(materialRef);
      
      // Update state
      setMaterials(prev => prev.filter(material => material.id !== materialToDiscard));
      setFilteredMaterials(prev => prev.filter(material => material.id !== materialToDiscard));
      
      alert("Material discarded successfully");
    } catch (error) {
      console.error("Error discarding material:", error);
      alert("Failed to discard material. Please try again.");
    } finally {
      setProcessing(false);
      setShowConfirmModal(false);
      setMaterialToDiscard(null);
    }
  };

  const closeDiscardModal = () => {
    setShowConfirmModal(false);
    setMaterialToDiscard(null);
  };

  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = filteredMaterials.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );

  const totalPages = Math.ceil(filteredMaterials.length / materialsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex-1">
      {/* Search Bar */}
      <div className="flex gap-3 mb-5">
        <div className="flex gap-3 flex-1 border justify-between items-center h-[55px] bg-[#faf6e9] rounded-xl text-[#2c5c2c] px-4">
          <p className="text-xl font-semibold">Raw Materials</p>
          <div className="flex items-center gap-2">
            {showSearchInput && (
              <input
                type="text"
                className="outline-none rounded-lg h-[40px] p-3 bg-[#faf6e9] border border-gray-300 transition-all w-60"
                placeholder="Search materials or suppliers..."
                value={searchTerm}
                onChange={handleSearch}
              />
            )}
            <IoIosSearch
              className="text-3xl font-bold cursor-pointer"
              onClick={handleSearchClick}
            />
          </div>
        </div>
      </div>

      {/* Loader */}
      {isLoading ? (
        <LoaderPlant />
      ) : (
        <>
          {/* Raw Material Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentMaterials.length > 0 ? (
              currentMaterials.map((material) => {
                const materialInfo = material.materialInfo || {};
                const supplierInfo = material.supplierInfo || {};
                const workerInfo = material.workerInfo || {};
                const originalQuantity = materialInfo.quantity || 0;
                
                return (
                  <div
                    key={material.id}
                    className="border p-4 rounded-lg shadow-md bg-[#faf6e9] flex flex-col"
                  >
                    <img
                      src={materialInfo.image || "https://via.placeholder.com/150"}
                      alt={materialInfo.name}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <h3 className="text-lg font-semibold text-[#2c5c2c]">
                      {materialInfo.name || "Unknown Material"}
                    </h3>
                    <div className="mt-2 space-y-1 flex-grow">
                      <p className="text-sm text-gray-600">
                        Quantity: {originalQuantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: ${materialInfo.price || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        Supplier: {supplierInfo.supplierName || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Worker: {workerInfo.workerName || "Unknown Worker"}
                      </p>
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Update Quantity:</span>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleQuantityChange(material.id, -1)}
                            disabled={updateQuantity[material.id] <= 0}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-red-200 text-red-700 disabled:opacity-50"
                          >
                            <AiOutlineMinus size={14} />
                          </button>
                          <span className="w-8 text-center">
                            {updateQuantity[material.id] || 0}
                          </span>
                          <button 
                            onClick={() => handleQuantityChange(material.id, 1)}
                            disabled={updateQuantity[material.id] >= originalQuantity}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-green-200 text-green-700 disabled:opacity-50"
                          >
                            <AiOutlinePlus size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(material.id, originalQuantity)}
                          disabled={processing || updateQuantity[material.id] === originalQuantity}
                          className="flex-1 py-2 rounded bg-[#607b64] text-white font-medium text-sm disabled:opacity-50"
                        >
                          Update Quantity
                        </button>
                        <button
                          onClick={() => openDiscardModal(material.id)}
                          disabled={processing}
                          className="px-3 py-2 rounded bg-red-500 text-white"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-lg text-gray-500">No materials found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-md ${
                    page === currentPage
                      ? "bg-[#607b64] text-white"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
            <p className="text-black text-lg font-bold mb-6 text-center">
              Are you want to discard this material?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeDiscardModal}
                className="px-6 py-2 rounded font-medium bg-green-600 text-white hover:bg-green-700"
              >
                NO
              </button>
              <button
                onClick={handleDiscard}
                className="px-6 py-2 rounded font-medium bg-red-600 text-white hover:bg-red-700"
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterial;
