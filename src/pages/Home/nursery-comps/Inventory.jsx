import { useContext, useEffect, useState } from "react";
import { IoIosArrowForward, IoIosSearch } from "react-icons/io";
import Loader from "../../../components/Loader/Loader";
import { AuthContext } from "../../../providers/AuthProvider";

const Inventory = () => {
  const [showInput, setShowInput] = useState(false);
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const plantsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingPlant, setIsDeletingPlant] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const { getPlantsFromInventory, removeFromInventory } =
    useContext(AuthContext);

  const handleSearchClick = () => {
    setShowInput(!showInput);
  };

  useEffect(() => {
    const fetchPlants = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getPlantsFromInventory();
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

  const handleRemove = async () => {
    if (!selectedPlant || !selectedPlant.id) return;

    try {
      setIsDeletingPlant(true);
      await removeFromInventory(selectedPlant.id);

      const updatedPlants = plants.filter(
        (plant) => plant.id !== selectedPlant.id
      );
      setPlants(updatedPlants);
      setFilteredPlants(updatedPlants);

      setNotification({
        show: true,
        message: `${
          selectedPlant.name || "Plant"
        } has been removed from inventory`,
        type: "success",
      });

      setSelectedPlant(null);

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error removing plant from inventory:", error);
      setNotification({
        show: true,
        message: "Failed to remove plant. Please try again.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } finally {
      setIsDeletingPlant(false);
    }
  };

  return (
    <div className="flex-1 p-2 md:p-0">
      {/* Header */}
      <div className="flex gap-3 rounded-xl mb-5">
        <div className="flex gap-3 flex-1 border justify-between items-center h-[55px] bg-[#faf6e9] rounded-xl text-[#2c5c2c] px-4">
          <p className="text-lg md:text-xl font-semibold">PLANTy</p>
          <div className="flex items-center gap-2">
            {showInput && (
              <input
                type="text"
                className="outline-none rounded-lg h-[40px] p-3 bg-[#faf6e9] border border-gray-300 transition-all w-40 md:w-60"
                placeholder="Search plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
            <button onClick={handleSearchClick} className="p-1">
              <IoIosSearch className="text-2xl md:text-3xl font-bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 p-3 md:p-4 rounded-lg shadow-lg z-50 text-sm md:text-base ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      {/* Loader */}
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Table - Mobile Cards */}
          <div className="block md:hidden">
            {currentPlants.length > 0 ? (
              currentPlants.map((plant) => (
                <div
                  key={plant.id}
                  className="bg-[#faf6e9] p-4 rounded-lg shadow mb-3"
                  onClick={() => setSelectedPlant(plant)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#607b64]">
                        {plant.name || plant.common_name || "Unknown"}
                      </p>
                      <p className="text-sm text-[#607b64]">
                        Stock: {plant.stock || "N/A"}
                      </p>
                      <p className="text-sm text-[#607b64]">
                        Category: {plant.categories || "N/A"}
                      </p>
                    </div>
                    <IoIosArrowForward className="text-lg" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-gray-500">
                No plants found.
              </div>
            )}
          </div>

          {/* Table - Desktop */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm">
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
              className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-sm md:text-base"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => Math.abs(currentPage - page) <= 1)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 md:px-4 rounded-md text-sm md:text-base ${
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
              className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-sm md:text-base"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2 md:p-0">
          <div className="bg-[#faf6e9] p-4 md:p-6 rounded-lg w-full max-w-md md:w-[700px] max-h-[90vh] overflow-y-auto">
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
            <div className="flex flex-col items-center gap-6">
              {/* Image */}
              <img
                src={selectedPlant.image || "https://via.placeholder.com/150"}
                alt={selectedPlant.name}
                className="w-full max-w-[300px] h-auto aspect-square object-cover rounded-lg shadow-md"
              />

              {/* Details */}
              <div className="w-full">
                <h2 className="text-2xl md:text-4xl font-bold text-[#2c5c2c] mb-2">
                  {selectedPlant.name || "Unknown"}
                </h2>
                <p className="text-lg md:text-xl italic text-gray-600 mb-4">
                  {selectedPlant.sci_name || "Unknown"}
                </p>

                <div className="grid grid-cols-1 gap-2">
                  <p className="text-md text-[#2c5c2c]">
                    <strong>Planted:</strong>{" "}
                    {selectedPlant.planting_date || "Unknown"}
                  </p>
                  <p className="text-md text-[#2c5c2c]">
                    <strong>Category:</strong>{" "}
                    {selectedPlant.categories || "Unknown"}
                  </p>
                  <p className="text-md text-[#2c5c2c]">
                    <strong>In Stock:</strong> {selectedPlant.stock || 0}
                  </p>
                  <p className="text-md text-[#2c5c2c]">
                    <strong>Price:</strong> {selectedPlant.price || 0}
                  </p>
                  <p className="text-md text-[#2c5c2c]">
                    <strong>Stage:</strong> {selectedPlant.stage || 0}
                  </p>
                </div>

                {/* Remove from Inventory Button */}
                <button
                  onClick={handleRemove}
                  disabled={isDeletingPlant}
                  className="mt-6 bg-[#607b64] hover:bg-[#4a6450] text-white font-semibold w-full py-3 rounded-lg text-base md:text-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDeletingPlant ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Removing...
                    </div>
                  ) : (
                    "Remove from Inventory"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;