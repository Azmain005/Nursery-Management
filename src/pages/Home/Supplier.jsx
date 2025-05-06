import React, { useState } from "react";
import Loader from "../../components/Loader/Loader";

const Supplier = () => {
  const [isLoading, setIsLoading] = useState(false); // Simulate loading state
  const [currentPage, setCurrentPage] = useState(1);
  const materialsPerPage = 8;

  // Simulated raw materials data
  const rawMaterials = [
    {
      id: 1,
      name: "Fertilizer",
      quantity: 10,
      price: 50,
      image: "https://via.placeholder.com/150",
      status: "pending",
    },
    {
      id: 2,
      name: "Soil",
      quantity: 20,
      price: 30,
      image: "https://via.placeholder.com/150",
      status: "pending",
    },
    {
      id: 3,
      name: "Seeds",
      quantity: 5,
      price: 100,
      image: "https://via.placeholder.com/150",
      status: "pending",
    },
    {
      id: 4,
      name: "Pots",
      quantity: 15,
      price: 20,
      image: "https://via.placeholder.com/150",
      status: "pending",
    },
    {
      id: 5,
      name: "Watering Can",
      quantity: 2,
      price: 25,
      image: "https://via.placeholder.com/150",
      status: "pending",
    },
    {
      id: 6,
      name: "Compost",
      quantity: 8,
      price: 40,
      image: "https://via.placeholder.com/150",
      status: "pending",
    },
    {
      id: 7,
      name: "Pesticides",
      quantity: 3,
      price: 60,
      image: "https://via.placeholder.com/150",
      status: "pending",
    },
    {
      id: 8,
      name: "Gloves",
      quantity: 12,
      price: 15,
      image: "https://via.placeholder.com/150",
      status: "pending",
    },
    {
      id: 9,
      name: "Shovel",
      quantity: 1,
      price: 35,
      image: "https://via.placeholder.com/150",
      status: "pending",
    },
  ];

  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = rawMaterials.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );

  const totalPages = Math.ceil(rawMaterials.length / materialsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleConfirm = (id) => {
    const materialIndex = rawMaterials.findIndex(
      (material) => material.id === id
    );
    if (materialIndex !== -1) {
      rawMaterials[materialIndex].status = "complete";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex-1 p-10 bg-[#fefaef]">
          <h1 className="text-3xl font-bold text-[#02542d] mb-8">
            Supplier Dashboard
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentMaterials.map((material) => (
              <div
                key={material.id}
                className="border rounded-lg shadow-md p-4 bg-[#faf6e9]"
              >
                <img
                  src={material.image}
                  alt={material.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h2 className="text-lg font-semibold text-[#2c5c2c]">
                  {material.name}
                </h2>
                <p className="text-sm text-gray-700">
                  Quantity: {material.quantity}
                </p>
                <p className="text-sm text-gray-700">
                  Price: ${material.price}
                </p>
                <button
                  className={`mt-4 w-full py-2 rounded-md text-white font-semibold ${
                    material.status === "complete"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#02542d] hover:bg-[#3a5a40]"
                  }`}
                  onClick={() => handleConfirm(material.id)}
                  disabled={material.status === "complete"}
                >
                  {material.status === "complete" ? "Complete" : "Confirm"}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
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
        </div>
      )}
    </div>
  );
};

export default Supplier;
