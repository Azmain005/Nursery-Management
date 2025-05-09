import { useEffect, useState } from "react";
import { IoIosSearch, IoIosAdd } from "react-icons/io";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import LoaderPlant from "../../../components/Loader/LoaderPlant";

const AddMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const materialsPerPage = 7;

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(
          collection(db, "Supplier_material")
        );
        const materialsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMaterials(materialsData);
        setFilteredMaterials(materialsData);
      } catch (error) {
        console.error("Error fetching materials from Firebase:", error);
      }
      setIsLoading(false);
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter((material) =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMaterials(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, materials]);

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

  const handleAddMaterial = async (e) => {
    e.preventDefault();

    const form = e.target;
    const quantity = parseInt(form.quantity.value);

    try {
      setIsLoading(true); // Show loader only in the modal

      const materialCollection = collection(db, "Material_for_sell");
      const q = query(
        materialCollection,
        where("name", "==", selectedMaterial.name)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Material exists, update the quantity
        const existingDoc = querySnapshot.docs[0];
        const existingData = existingDoc.data();
        const newQuantity = parseInt(existingData.quantity) + quantity;

        await updateDoc(doc(db, "Material_for_sell", existingDoc.id), {
          quantity: newQuantity,
        });
      } else {
        // Material does not exist, create a new document
        await addDoc(materialCollection, {
          name: selectedMaterial.name,
          price: selectedMaterial.price,
          image: selectedMaterial.image,
          quantity,
        });
      }

      setSelectedMaterial(null); // Close the modal
    } catch (error) {
      console.error("Error adding or updating material:", error);
    } finally {
      setIsLoading(false); // Hide loader only in the modal
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex gap-3 rounded-xl mb-5">
        <div className="flex gap-3 flex-1 border justify-between items-center h-[55px] bg-[#faf6e9] rounded-xl text-[#2c5c2c] px-4">
          <p className="text-xl font-semibold">Add Material</p>
          <div className="flex items-center gap-2">
            {showSearchInput && (
              <input
                type="text"
                className="outline-none rounded-lg h-[40px] p-3 bg-[#faf6e9] border border-gray-300 transition-all w-60"
                placeholder="Search material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
            <IoIosSearch
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="text-3xl font-bold cursor-pointer text-[#2c5c2c]"
            />
          </div>
        </div>
      </div>

      {/* Materials */}
      {isLoading && !selectedMaterial ? (
        <LoaderPlant />
      ) : (
        <div className="mt-5">
          {currentMaterials.length > 0 ? (
            currentMaterials.map((material) => (
              <div
                key={material.id}
                className="flex gap-3 items-center border p-2 rounded-lg shadow-md mb-4 bg-[#faf6e9] hover:shadow-lg transition duration-300"
              >
                <img
                  src={material.image}
                  alt={material.name}
                  className="w-[70px] h-[70px] object-contain rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-[#2c5c2c]">
                    {material.name}
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    ${material.price}
                  </p>
                </div>
                <button
                  className="btn bg-[#faf6e9] border-none"
                  onClick={() => {
                    setSelectedMaterial(material);
                    setTimeout(() => {
                      document.getElementById("add_material_modal").showModal();
                    }, 0);
                  }}
                >
                  <IoIosAdd className="text-3xl font-bold" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-10 text-lg">
              No materials found.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-8 gap-2 flex-wrap">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => Math.abs(currentPage - page) <= 1)
          .map((page) => (
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

      {/* Modal */}
      {selectedMaterial && (
        <dialog id="add_material_modal" className="modal open">
          <div className="modal-box bg-[#faf6e9] text-[#2c5c2c]">
            <form onSubmit={handleAddMaterial} className="flex flex-col gap-4">
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setSelectedMaterial(null)}
              >
                ✕
              </button>

              <h3 className="font-bold text-lg mb-2">
                Add Material Information
              </h3>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Material Name</label>
                <input
                  type="text"
                  value={selectedMaterial.name}
                  className="input bg-[#faf6e9] outline-none w-full"
                  readOnly
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Price</label>
                <input
                  type="text"
                  value={`$${selectedMaterial.price}`}
                  className="input bg-[#faf6e9] outline-none w-full"
                  readOnly
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="input bg-[#faf6e9] outline-none w-full"
                  min="1"
                  required
                />
              </div>

              {isLoading ? (
                <LoaderPlant />
              ) : (
                <button
                  type="submit"
                  className="btn bg-[#02542d] text-white text-lg mt-4 w-full"
                >
                  Add
                </button>
              )}
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default AddMaterial;
