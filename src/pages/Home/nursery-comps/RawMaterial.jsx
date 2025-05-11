import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { db } from "../../../Auth/firebase.init";
import LoaderPlant from "../../../components/Loader/LoaderPlant";

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
  const [originalMaterials, setOriginalMaterials] = useState([]); // Store original materials for reference
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
      const confirmedOrders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Store original materials for reference
      setOriginalMaterials(confirmedOrders);

      // Group materials with same name, price, supplier and worker
      const groupedMaterials = {};
      
      confirmedOrders.forEach(order => {
        const materialInfo = order.materialInfo || {};
        const supplierInfo = order.supplierInfo || {};
        const workerInfo = order.workerInfo || {};
        
        // Create a unique key based on material properties
        const key = `${materialInfo.name}_${materialInfo.price}_${supplierInfo.supplierName}_${workerInfo.workerName}`;
        
        if (!groupedMaterials[key]) {
          // First occurrence of this material combination
          groupedMaterials[key] = {
            ...order,
            originalIds: [order.id], // Track original IDs
            materialInfo: {
              ...materialInfo,
              quantity: materialInfo.quantity || 0
            }
          };
        } else {
          // Add quantity and track original ID
          groupedMaterials[key].materialInfo.quantity += (materialInfo.quantity || 0);
          groupedMaterials[key].originalIds.push(order.id);
        }
      });

      const combinedMaterials = Object.values(groupedMaterials);

      // Initialize quantity state for each material
      const initialQuantityState = {};
      combinedMaterials.forEach(material => {
        initialQuantityState[material.id] = material.materialInfo?.quantity || 0;
      });
      setUpdateQuantity(initialQuantityState);

      setMaterials(combinedMaterials);
      setFilteredMaterials(combinedMaterials);
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
    setUpdateQuantity((prev) => {
      const currentQuantity = prev[materialId] || 0;
      // Ensure quantity doesn't go below 0
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [materialId]: newQuantity };
    });
  };

  const handleUpdateQuantity = async (material, originalQuantity) => {
    if (processing) return;

    setProcessing(true);
    try {
      const newQuantity = updateQuantity[material.id] || 0;
      const quantityDifference = newQuantity - originalQuantity;
      
      if (newQuantity === 0) {
        // Delete all associated original materials
        for (const originalId of material.originalIds) {
          await deleteDoc(doc(db, "supplier_confirmed_orders", originalId));
        }
        
        // Update state
        setMaterials(prev => prev.filter(m => m.id !== material.id));
        setFilteredMaterials(prev => prev.filter(m => m.id !== material.id));
        setOriginalMaterials(prev => prev.filter(m => !material.originalIds.includes(m.id)));
        
        alert("Material removed successfully");
      } else if (newQuantity !== originalQuantity) {
        // We need to distribute the quantity change among the original materials
        if (quantityDifference < 0) {
          // Reducing quantity - remove from materials in order
          let remainingToReduce = Math.abs(quantityDifference);
          const updatedOriginals = [...originalMaterials];
          
          // Sort original materials by ID to ensure consistent processing
          const relevantMaterials = updatedOriginals
            .filter(m => material.originalIds.includes(m.id))
            .sort((a, b) => a.id.localeCompare(b.id));
            
          for (const origMaterial of relevantMaterials) {
            if (remainingToReduce <= 0) break;
            
            const currentQuantity = origMaterial.materialInfo?.quantity || 0;
            
            if (currentQuantity <= remainingToReduce) {
              // Delete this document completely
              await deleteDoc(doc(db, "supplier_confirmed_orders", origMaterial.id));
              remainingToReduce -= currentQuantity;
              
              // Update originals
              const index = updatedOriginals.findIndex(m => m.id === origMaterial.id);
              if (index !== -1) {
                updatedOriginals.splice(index, 1);
              }
            } else {
              // Reduce this document's quantity
              const newOriginalQuantity = currentQuantity - remainingToReduce;
              await updateDoc(doc(db, "supplier_confirmed_orders", origMaterial.id), {
                "materialInfo.quantity": newOriginalQuantity
              });
              
              // Update originals
              const index = updatedOriginals.findIndex(m => m.id === origMaterial.id);
              if (index !== -1) {
                updatedOriginals[index] = {
                  ...updatedOriginals[index],
                  materialInfo: {
                    ...updatedOriginals[index].materialInfo,
                    quantity: newOriginalQuantity
                  }
                };
              }
              
              remainingToReduce = 0;
            }
          }
          
          setOriginalMaterials(updatedOriginals);
        } else {
          // Increasing quantity - not supported in this version
          // This would require creating new material entries
          alert("Increasing quantity is not supported in this version");
          setProcessing(false);
          return;
        }
        
        // Update the UI state with the new grouped material
        const updatedMaterial = {
          ...material,
          materialInfo: {
            ...material.materialInfo,
            quantity: newQuantity
          }
        };
        
        setMaterials(prev => 
          prev.map(m => m.id === material.id ? updatedMaterial : m)
        );
        setFilteredMaterials(prev => 
          prev.map(m => m.id === material.id ? updatedMaterial : m)
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
      // Find the material with all its original IDs
      const materialToRemove = materials.find(m => m.id === materialToDiscard);
      
      if (materialToRemove && materialToRemove.originalIds) {
        // Delete all associated original materials
        for (const originalId of materialToRemove.originalIds) {
          await deleteDoc(doc(db, "supplier_confirmed_orders", originalId));
        }
        
        // Update original materials state
        setOriginalMaterials(prev => 
          prev.filter(m => !materialToRemove.originalIds.includes(m.id))
        );
      } else {
        // Fallback to single delete
        await deleteDoc(doc(db, "supplier_confirmed_orders", materialToDiscard));
        
        // Update original materials state
        setOriginalMaterials(prev => 
          prev.filter(m => m.id !== materialToDiscard)
        );
      }
      
      // Update UI state
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
                      src={
                        materialInfo.image || "https://via.placeholder.com/150"
                      }
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
                      {material.originalIds && material.originalIds.length > 1 && (
                        <p className="text-xs text-gray-500">
                          Combined from {material.originalIds.length} orders
                        </p>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">
                          Update Quantity:
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(material.id, -1)
                            }
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
                          onClick={() => handleUpdateQuantity(material, originalQuantity)}
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                )
              )}

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
          <div className="bg-[#fefaef] rounded-lg p-6 shadow-xl max-w-sm w-full">
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
