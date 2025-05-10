import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import {
  FaUser,
  FaBox,
  FaTruck,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { ProfileHeader } from "./CommonComponents";

const SupplierProfile = ({
  user,
  userData,
  handleUpdateProfile,
  displayName,
  setDisplayName,
  handleUpdatePassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  const [stats, setStats] = useState({
    totalMaterials: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const materialsRef = collection(db, "Material_for_sell");
        const materialsSnapshot = await getDocs(materialsRef);

        const stats = {
          totalMaterials: 0,
          lowStock: 0,
          outOfStock: 0,
        };

        materialsSnapshot.forEach((doc) => {
          const material = doc.data();
          // Check if the material belongs to the current supplier
          if (material.supplierId === user.uid) {
            // Count total number of materials
            stats.totalMaterials++;

            // Check quantity for low stock and out of stock
            const quantity = Number(material.quantity) || 0;

            if (quantity === 0) {
              stats.outOfStock++;
            } else if (quantity <= 5) {
              stats.lowStock++;
            }
          }
        });

        console.log("Material Stats for supplier:", user.uid, stats);
        setStats(stats);
      } catch (error) {
        console.error("Error fetching material stats:", error);
      }
    };

    fetchStats();
  }, [user.uid]);

  return (
    <div className="space-y-6 bg-[#FEFDF4] min-h-screen w-full">
      <ProfileHeader
        user={user}
        userData={userData}
        handleUpdateProfile={handleUpdateProfile}
        displayName={displayName}
        setDisplayName={setDisplayName}
        handleUpdatePassword={handleUpdatePassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
          <div className="flex items-center">
            <FaBox className="h-8 w-8 text-[#3a5a40]" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Materials
              </p>
              <p className="text-2xl font-semibold text-[#02542d]">
                {stats.totalMaterials}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-8 w-8 text-[#3a5a40]" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-[#02542d]">
                {stats.lowStock}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
          <div className="flex items-center">
            <FaTimes className="h-8 w-8 text-[#3a5a40]" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-[#02542d]">
                {stats.outOfStock}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
