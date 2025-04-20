import Lottie from "lottie-react";
import leafAnimation from "../../assets/Animation - 1745017059131.json";

const Loader = () => {
  return (
    <div className="mx-auto w-[250px] mt-20 min-h-screen">
      <Lottie animationData={leafAnimation} loop />
    </div>
  );
};

export default Loader;
