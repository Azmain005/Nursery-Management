import { collection, getDocs } from "firebase/firestore"; // import Firestore functions
import { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { db } from "../../../Auth/firebase.init"; // <-- your Firebase config
import PlantCardDesc from "./PlantCardDesc";

const Inventory = () => {
  const [showInput, setShowInput] = useState(false);
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const plantsPerPage = 7;
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
        const querySnapshot = await getDocs(collection(db, "plants")); // your Firestore collection
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
      const filtered = plants.filter((plant) =>
        plant.common_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
        <p className="text-center text-gray-500 mt-10 text-lg">
          Loading plants...
        </p>
      ) : (
        <>
          {/* Plants */}
          {/* <div>{plants.length}</div> */}
          <div className="mt-5">
            {currentPlants.length > 0 ? (
              currentPlants.map((plant) => (
                <PlantCardDesc
                  key={plant.id}
                  plant={plant}
                  onClick={() => setSelectedPlant(plant)} // open modal when clicked
                />
              ))
            ) : (
              <p className="text-center text-gray-500 mt-10 text-lg">
                No plants found.
              </p>
            )}
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
          <div className="bg-white p-6 rounded-lg w-[90%] md:w-[500px]">
            <h2 className="text-2xl font-bold mb-4">
              {selectedPlant.common_name}
            </h2>
            <p>
              <strong>Scientific Name:</strong> {selectedPlant.scientific_name}
            </p>
            <p>
              <strong>Family:</strong> {selectedPlant.family}
            </p>
            {/* Add more fields from your DB if needed */}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseModal}
                className="bg-[#607b64] hover:bg-[#4a6450] text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
