import { IoIosAdd } from "react-icons/io";

const PlantCard = ({ plant, setSelectedPlant }) => {
  const handleOpenModal = () => {
    setSelectedPlant(plant);
    document.getElementById("add_plant_modal").showModal();
  };

  return (
    <div className="flex gap-3 items-center border p-2 rounded-lg shadow-md mb-4 bg-[#faf6e9] hover:shadow-lg transition duration-300">
      <img
        src={plant.default_image.medium_url}
        alt={plant.common_name}
        className="w-[70px] h-[70px] object-cover rounded-lg"
      />
      <div className="flex-1">
        <p className="text-lg font-semibold text-[#2c5c2c]">
          {plant.common_name}
        </p>
        <p className="text-sm text-gray-700 italic">{plant.scientific_name}</p>
      </div>

      <button
        className="btn bg-[#faf6e9] border-none"
        onClick={handleOpenModal}
      >
        <IoIosAdd className="text-3xl font-bold" />
      </button>
    </div>
  );
};

export default PlantCard;
