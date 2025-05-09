import { useState, useEffect, useContext } from "react";
import { collection, getDocs, addDoc, where } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import { AuthContext } from "../../../providers/AuthProvider";
import { IoIosSearch } from "react-icons/io";
import Loader from "../../../components/Loader/Loader";

const Maintenance = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const materialsPerPage = 12; // 4 rows * 3 cards per row
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(
          collection(db, "Material_for_sell")
        );
        const materialsData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((material) => material.quantity > 0); // Only include materials with quantity > 0
        setMaterials(materialsData);
        setFilteredMaterials(materialsData);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setIsLoading(false);
      }
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
    }
  }, [searchTerm, materials]);

  const handleAddToCart = async (material) => {
    setIsLoading(true);
    try {
      // Fetch the logged-in user's email from AuthContext
      const userEmail = user.email;

      // Query the user_data collection to find the document ID for this email
      const userQuery = await getDocs(
        collection(db, "user_data"),
        where("email", "==", userEmail)
      );
      const userId = userQuery.docs[1]?.id;

      if (!userId) {
        throw new Error("User not found in user_data collection");
      }

      // Add the material to the nursery_cart collection with the user's document ID
      await addDoc(collection(db, "nursery_cart"), {
        userId: userId,
        materialId: material.id,
        name: material.name,
        price: material.price,
        image: material.image,
      });
      alert(`${material.name} added to cart successfully!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setIsLoading(false);
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
    <div className="flex-1 p-6">
      {/* Search Bar */}
      <div className="flex gap-3 mb-5">
        <div className="flex gap-3 flex-1 border justify-between items-center h-[55px] bg-[#faf6e9] rounded-xl text-[#2c5c2c] px-4">
          <p className="text-xl font-semibold">Materials</p>
          <div className="flex items-center gap-2">
            {showSearchInput && (
              <input
                type="text"
                className="outline-none rounded-lg h-[40px] p-3 bg-[#faf6e9] border border-gray-300 transition-all w-60"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
            <IoIosSearch
              className="text-3xl font-bold cursor-pointer"
              onClick={() => setShowSearchInput(!showSearchInput)}
            />
          </div>
        </div>
      </div>

      {/* Loader */}
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Material Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {currentMaterials.map((material) => (
              <div
                key={material.id}
                className="border p-4 rounded-lg shadow-md bg-[#607b64] text-white flex flex-col"
              >
                <img
                  src={material.image || "https://via.placeholder.com/150"}
                  alt={material.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold text-white mb-1">
                  {material.name}
                </h3>
                <p className="text-sm text-white mb-4">${material.price}</p>
                <button
                  onClick={() => handleAddToCart(material)}
                  className="mt-auto bg-[#faf6e9] text-[#607b64] font-semibold py-2 px-4 rounded flex items-center justify-center gap-2"
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
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
    </div>
  );
};

export default Maintenance;
