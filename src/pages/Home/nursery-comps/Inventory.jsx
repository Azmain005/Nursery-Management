import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoIosArrowForward, IoIosSearch } from "react-icons/io";
import { db } from "../../../Auth/firebase.init";
import Loader from "../../../components/Loader/Loader";
const Inventory = () => {
  const [showInput, setShowInput] = useState(false);
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const plantsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchClick = () => {
    setShowInput(!showInput);
  };

  useEffect(() => {
    const fetchPlants = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "plants"));
        const plantsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlants(plantsData);
        setFilteredPlants(plantsData);
      } catch (error) {
        console.error("Error fetching plants from Firebase:", error);
      }
      setIsLoading(false);
    };

    fetchPlants();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPlants(plants);
    } else {
      const filtered = plants.filter((plant) => {
        const name = plant.name || plant.scientific_name || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredPlants(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, plants]);

  const indexOfLastPlant = currentPage * plantsPerPage;
  const indexOfFirstPlant = indexOfLastPlant - plantsPerPage;
  const currentPlants = filteredPlants.slice(
    indexOfFirstPlant,
    indexOfLastPlant
  );

  const totalPages = Math.ceil(filteredPlants.length / plantsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCloseModal = () => {
    setSelectedPlant(null);
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex gap-3 rounded-xl mb-5">
        <div className="flex gap-3 flex-1 border justify-between items-center h-[55px] bg-[#faf6e9] rounded-xl text-[#2c5c2c] px-4">
          <p className="text-xl font-semibold">PLANTy</p>
          <div className="flex items-center gap-2">
            {showInput && (
              <input
                type="text"
                className="outline-none rounded-lg h-[40px] p-3 bg-[#faf6e9] border border-gray-300 transition-all w-60"
                placeholder="Enter plant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
        <Loader />
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#faf6e9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm text-[#607b64] uppercase tracking-wider font-bold">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-[#607b64] uppercase tracking-wider font-bold">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-[#607b64] uppercase tracking-wider font-bold">
                    Category
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="bg-[#faf6e9] divide-y divide-gray-200">
                {currentPlants.length > 0 ? (
                  currentPlants.map((plant) => (
                    <tr
                      key={plant.id}
                      className="hover:bg-[#faf6e9] cursor-pointer transition"
                      onClick={() => setSelectedPlant(plant)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#607b64] font-bold">
                        {plant.name || plant.common_name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#607b64] font-bold">
                        {plant.stock || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#607b64] font-bold">
                        {plant.categories || "N/A"}
                      </td>
                      <td>
                        <IoIosArrowForward />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                    >
                      No plants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
        </>
      )}

      {/* Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-[#faf6e9] p-6 rounded-lg w-[90%] md:w-[700px] flex flex-col">
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="text-2xl font-bold text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Main Content */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Image */}
              <img
                src={selectedPlant.image || "https://via.placeholder.com/150"}
                alt={selectedPlant.name}
                className="w-[300px] h-[300px] object-cover rounded-lg shadow-md"
              />

              {/* Details */}
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-[#2c5c2c] mb-2">
                  {selectedPlant.name || "Unknown"}
                </h2>
                <p className="text-xl italic text-gray-600 mb-4">
                  {selectedPlant.sci_name || "Unknown"}
                </p>

                <p className="text-md mb-2 text-[#2c5c2c]">
                  <strong>Planted:</strong>{" "}
                  {selectedPlant.planting_date || "Unknown"}
                </p>
                <p className="text-md mb-2 text-[#2c5c2c]">
                  <strong>Expected:</strong>{" "}
                  {selectedPlant.harvest_date || "Unknown"}
                </p>
                <p className="text-md mb-2 text-[#2c5c2c]">
                  <strong>In Stock:</strong> {selectedPlant.stock || 0}
                </p>
                <p className="text-md mb-2 text-[#2c5c2c]">
                  <strong>Price:</strong> {selectedPlant.price || 0}
                </p>

                {/* <div className="flex items-center gap-2 mb-4">
            <p className="text-md"><strong>Automatically add to inventory:</strong></p>
            <input type="checkbox" checked readOnly className="w-5 h-5" />
          </div> */}

                {/* Add to Inventory Button */}
                {/* <button className="bg-[#607b64] hover:bg-[#4a6450] text-white font-semibold w-full py-3 rounded-lg text-lg transition">
            Add to Inventory
          </button> */}
              </div>
            </div>

            {/* Tags */}
            {/* <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
        {["Seed", "Germination", "Seeding", "Vegetative", "Flowering", "Pollinization", "Fruit", "Dispersal", "Senescence"].map((stage) => (
          <span
            key={stage}
            className="bg-[#e3e6d8] text-[#2c5c2c] px-3 py-1 rounded-full text-sm font-medium"
          >
            {stage}
          </span>
        ))}
      </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
