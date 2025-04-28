import { addDoc, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { db } from "../../../Auth/firebase.init";
import LoaderPlant from "../../../components/Loader/LoaderPlant";
import PlantData from "../../../data/filtered_plant_data.json";
import PlantCard from "./PlantCard";

const AddPlant = () => {
  const [showInput, setShowInput] = useState(false);
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const plantsPerPage = 7;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // state for loader

  const handleSearchClick = () => {
    setShowInput(!showInput);
  };

  useEffect(() => {
    setPlants(PlantData);
    setFilteredPlants(PlantData);
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

      {/* Plants */}
      <div className="mt-5">
        {currentPlants.length > 0 ? (
          currentPlants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              setSelectedPlant={setSelectedPlant}
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

      {/* Modal */}
      <dialog id="add_plant_modal" className="modal">
        <div className="modal-box bg-[#faf6e9] text-[#2c5c2c]">
          {selectedPlant && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true); // show loader

                const form = e.target;
                const name = form.plant_name.value;
                const number = form.number_of_plants.value;
                const planting_date = form.planting_date.value;
                const harvest_date = form.harvest_date.value;
                const price = form.price.value;
                const categories = form.categories.value;

                try {
                  await addDoc(collection(db, "plants"), {
                    name: name,
                    stock: number,
                    planting_date: planting_date,
                    harvest_date: harvest_date,
                    price: price,
                    categories: categories,
                    original_plant_id: selectedPlant.id,
                    image: selectedPlant.default_image.medium_url,
                  });

                  alert("🌱 Plant added successfully!");

                  form.reset();
                  document.getElementById("add_plant_modal").close();
                } catch (error) {
                  console.error("Error adding plant:", error);
                  alert("❌ Failed to add plant.");
                } finally {
                  setIsLoading(false); // hide loader
                }
              }}
              className="flex flex-col gap-4"
            >
              {/* Close Button */}
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() =>
                  document.getElementById("add_plant_modal").close()
                }
              >
                ✕
              </button>

              <h3 className="font-bold text-lg mb-2">Add Plant Information</h3>

              {/* Plant Name */}
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Plant Name</label>
                <input
                  type="text"
                  name="plant_name"
                  className="input bg-[#faf6e9] outline-none w-full"
                  value={selectedPlant.common_name}
                  readOnly
                />
              </div>

              {/* Other Inputs */}
              <div className="flex flex-col">
                <label className="font-semibold mb-1">How many plants?</label>
                <input
                  type="number"
                  name="number_of_plants"
                  className="input bg-[#faf6e9] outline-none w-full"
                  min="1"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Planting Date</label>
                <input
                  type="date"
                  name="planting_date"
                  className="input bg-[#faf6e9] w-full"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">
                  Expected Harvest Date
                </label>
                <input
                  type="date"
                  name="harvest_date"
                  className="input bg-[#faf6e9] w-full"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  className="input bg-[#faf6e9] outline-none w-full"
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Category</label>
                <input
                  type="text"
                  name="categories"
                  className="input bg-[#faf6e9] outline-none w-full"
                  placeholder="Enter category"
                  required
                />
              </div>

              {/* Show loader when adding plant */}
              {isLoading ? (
                // <div className="flex justify-center mt-4">
                //   <IoIosRefresh className="animate-spin text-4xl text-[#607b64]" />
                // </div>
                <LoaderPlant></LoaderPlant>
              ) : (
                <button
                  type="submit"
                  className="btn bg-[#02542d] text-white text-lg mt-4 w-full"
                >
                  Add
                </button>
              )}
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default AddPlant;

// {success && (
//     <div role="alert" className="alert alert-success w-[200px] mx-auto mt-5 text-center">
//       <span className="text-sm font-semi-bold">Plant Added Successfully!!</span>
//     </div>
//   )}
