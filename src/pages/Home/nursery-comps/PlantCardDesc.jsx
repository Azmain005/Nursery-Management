import React from "react";

const PlantCardDesc = ({ plant, onClick }) => {
  return (
    <div
      className="border rounded-lg p-4 mb-4 shadow-sm cursor-pointer hover:bg-[#faf6e9] transition"
      onClick={onClick}
    >
      <img src={plant.image} alt="" />
      <h3 className="text-lg font-bold text-[#2c5c2c]">{plant.name}</h3>
      <p className="text-sm text-gray-600">{plant.price}</p>
    </div>
  );
};

export default PlantCardDesc;
