import { addDoc, collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../Auth/firebase.init";
import LoaderPlant from "../../../components/Loader/LoaderPlant";
import { IoIosSearch } from "react-icons/io";

const RawMaterial = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const materialsPerPage = 6;

  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const q = query(collection(db, "raw_material"));
        const querySnapshot = await getDocs(q);
        const materials = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRawMaterials(materials);
        setFilteredMaterials(materials);
      } catch (error) {
        console.error("Error fetching raw materials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRawMaterials();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = rawMaterials.filter((material) =>
      material.name.toLowerCase().includes(term)
    );
    setFilteredMaterials(filtered);
    setCurrentPage(1); // Reset to the first page after search
  };

  const handleSearchClick = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchTerm("");
      setFilteredMaterials(rawMaterials);
    }
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
                placeholder="Search raw materials..."
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
            {currentMaterials.map((material) => (
              <div
                key={material.id}
                className="border p-4 rounded-lg shadow-md bg-[#faf6e9]"
              >
                <img
                  src={material.image || "https://via.placeholder.com/150"}
                  alt={material.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold text-[#2c5c2c]">
                  {material.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Quantity: {material.quantity}
                </p>
                <p className="text-sm text-gray-600">
                  Price: ${material.price}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
};

export default RawMaterial;
