import { doc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { IoIosArrowForward, IoIosSearch } from "react-icons/io";
import { db } from "../../../Auth/firebase.init";
import { default as Loader } from "../../../components/Loader/Loader";
import { AuthContext } from "../../../providers/AuthProvider";

const Monitoring = () => {
  const [showInput, setShowInput] = useState(false);
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const plantsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addingToInventory, setAddingToInventory] = useState(false);
  const [inventoryMessage, setInventoryMessage] = useState({
    show: false,
    text: "",
    type: "",
  });
  const { getPlantsFromDatabase, addToInventory, deleteFromInventory } =
    useContext(AuthContext);

  const handleSearchClick = () => {
    setShowInput(!showInput);
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getPlantsFromDatabase();
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
    setInventoryMessage({ show: false, text: "", type: "" });
  };

  const handleStageChange = async (plantId, newStage) => {
    try {
      const plantRef = doc(db, "plants", plantId);
      await updateDoc(plantRef, {
        stage: newStage,
      });

      const updatedPlants = plants.map((plant) =>
        plant.id === plantId ? { ...plant, stage: newStage } : plant
      );
      setPlants(updatedPlants);
      setFilteredPlants(updatedPlants);

      if (selectedPlant && selectedPlant.id === plantId) {
        setSelectedPlant({ ...selectedPlant, stage: newStage });
      }
    } catch (error) {
      console.error("Error updating stage:", error);
    }
  };

  const handleAddToInventory = async () => {
    if (!selectedPlant) return;

    setAddingToInventory(true);
    try {
      const inventoryData = {
        plant_id: selectedPlant.original_plant_id,
        name: selectedPlant.name || "Unknown",
        sci_name:
          selectedPlant.sci_name || selectedPlant.scientific_name || "Unknown",
        stage: selectedPlant.stage || "N/A",
        planting_date: selectedPlant.planting_date || "Unknown",
        harvest_date: selectedPlant.harvest_date || "Unknown",
        stock: selectedPlant.stock,
        price: selectedPlant.price,
        image: selectedPlant.image || "https://via.placeholder.com/150",
        categories: selectedPlant.categories,
      };

      await addToInventory(inventoryData);
      await deleteFromInventory(selectedPlant.id);

      const updatedPlants = plants.filter(
        (plant) => plant.id !== selectedPlant.id
      );
      setPlants(updatedPlants);
      setFilteredPlants(updatedPlants);

      setInventoryMessage({
        show: true,
        text: "Successfully added to inventory and removed from plants!",
        type: "success",
      });

      setTimeout(() => {
        handleCloseModal();
        setTimeout(() => {
          fetchPlants();
        }, 500);
      }, 1500);
    } catch (error) {
      console.error("Error managing inventory:", error);
      setInventoryMessage({
        show: true,
        text: "Failed to process. Please try again.",
        type: "error",
      });
    } finally {
      setAddingToInventory(false);
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

      {/* Loader */}
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-3">
            {currentPlants.length > 0 ? (
              currentPlants.map((plant) => (
                <div
                  key={plant.id}
                  className="bg-[#faf6e9] p-4 rounded-lg shadow"
                  onClick={() => setSelectedPlant(plant)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#607b64]">
                        {plant.name || plant.common_name || "Unknown"}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-sm text-[#607b64]">
                          Stage: {plant.stage || "N/A"}
                        </span>
                        <span className="text-sm text-[#607b64]">
                          Harvest: {plant.harvest_date || "N/A"}
                        </span>
                      </div>
                    </div>
                    <IoIosArrowForward className="text-lg mt-1" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-gray-500">
                No plants found.
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#faf6e9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm text-[#607b64] uppercase tracking-wider font-bold">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-[#607b64] uppercase tracking-wider font-bold">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-[#607b64] uppercase tracking-wider font-bold">
                    Harvest
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
                        {plant.stage || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#607b64] font-bold">
                        {plant.harvest_date || "N/A"}
                      </td>
                      <td>
                        <IoIosArrowForward />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500"
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
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="text-2xl font-bold text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              <img
                src={selectedPlant.image || "https://via.placeholder.com/150"}
                alt={selectedPlant.name}
                className="w-full max-w-[300px] h-auto aspect-square object-cover rounded-lg shadow-md"
              />
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
                    <strong>Expected:</strong>{" "}
                    {selectedPlant.harvest_date || "Unknown"}
                  </p>
                  <p className="text-md text-[#2c5c2c]">
                    <strong>In Stock:</strong> {selectedPlant.stock || 0}
                  </p>
                  <p className="text-md text-[#2c5c2c]">
                    <strong>Price:</strong> {selectedPlant.price || 0}
                  </p>
                </div>

                {inventoryMessage.show && (
                  <div
                    className={`p-3 rounded-lg my-3 text-center font-medium text-sm md:text-base ${
                      inventoryMessage.type === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {inventoryMessage.text}
                  </div>
                )}

                <button
                  className={`mt-4 ${
                    addingToInventory
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#607b64] hover:bg-[#4a6450]"
                  } text-white font-semibold w-full py-3 rounded-lg text-base md:text-lg transition flex justify-center items-center`}
                  onClick={handleAddToInventory}
                  disabled={addingToInventory}
                >
                  {addingToInventory ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Move to Inventory"
                  )}
                </button>
              </div>
            </div>

            {/* Stage Selection Tags */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
              {[
                "Seed",
                "Germination",
                "Seeding",
                "Vegetative",
                "Flowering",
                "Pollination",
                "Fruit",
                "Dispersal",
                "Senescence",
              ].map((stage) => (
                <button
                  key={stage}
                  onClick={() => {
                    handleStageChange(selectedPlant.id, stage);
                    if (stage === "Senescence") {
                      handleAddToInventory(selectedPlant.id);
                    }
                  }}
                  className={`px-2 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium transition ${
                    selectedPlant.stage === stage
                      ? "bg-[#2c5c2c] text-white"
                      : "bg-[#e3e6d8] text-[#2c5c2c] hover:bg-[#cfd3be]"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitoring;