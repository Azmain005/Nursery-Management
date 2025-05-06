import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import LoaderPlant from "../../../components/Loader/LoaderPlant";

const RawMaterial = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [imageName, setImageName] = useState("Image of the material");
  const materialsPerPage = 6;

  const rawMaterials = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Example data

  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = rawMaterials.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );

  const totalPages = Math.ceil(rawMaterials.length / materialsPerPage);

  const handleOrderClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target;
    const image = form.image.files[0];
    const name = form.name.value;
    const quantity = form.quantity.value;
    const price = form.price.value;

    try {
      // Add data to Firestore
      await addDoc(collection(db, "raw_order"), {
        image: image ? image.name : "",
        name,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
      });

      setNotificationVisible(true);
      setTimeout(() => setNotificationVisible(false), 2000);
      form.reset();
      setImageName("Image of the material");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding order:", error);
      alert("Failed to add order.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageName(file ? file.name : "Image of the material");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex-1">
      {/* Order Button */}
      <button
        className="w-full bg-[#02542d] text-white py-3 rounded-lg mb-5"
        onClick={handleOrderClick}
      >
        Order Raw Material
      </button>

      {/* Raw Material Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentMaterials.map((item) => (
          <div
            key={item}
            className="border p-4 rounded-lg shadow-md bg-[#faf6e9]"
          >
            <img
              src="https://via.placeholder.com/150"
              alt="Raw Material"
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="text-lg font-semibold text-[#2c5c2c]">
              Raw Material {item}
            </h3>
            <p className="text-sm text-gray-600">Quantity: {item * 10}</p>
            <p className="text-sm text-gray-600">Price: ${item * 5}</p>
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

      {/* Modal */}
      {isModalOpen && (
        <dialog open className="modal">
          <div className="modal-box bg-[#faf6e9] text-[#2c5c2c]">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>

            <h3 className="font-bold text-lg mb-4">Order Raw Material</h3>

            <form onSubmit={handleConfirmOrder} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label className="btn bg-[#2c5c2c] text-white hover:bg-[#1e3b1e]">
                  Browse
                  <input
                    type="file"
                    name="image"
                    className="hidden"
                    onChange={handleImageChange}
                    required
                  />
                </label>
                <span className="text-sm text-gray-600">{imageName}</span>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  className="input bg-[#faf6e9] outline-none w-full"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="input bg-[#faf6e9] outline-none w-full"
                  min="1"
                  placeholder="Enter quantity"
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

              {isLoading ? (
                <LoaderPlant />
              ) : (
                <button
                  type="submit"
                  className="btn bg-[#02542d] text-white text-lg mt-4 w-full"
                >
                  Confirm Order
                </button>
              )}
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default RawMaterial;
