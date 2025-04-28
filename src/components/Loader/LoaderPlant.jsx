import Lottie from "lottie-react";
import leafAnimation from "../../assets/Animation - 1745017059131.json";
// import lan from "../../assets/new.json";

const LoaderPlant = () => {
  return (
    <div className="mx-auto w-[100px]">
      <Lottie animationData={leafAnimation} loop speed="100" />
      {/* <Lottie animationData={lan} loop /> */}
    </div>
  );
};

export default LoaderPlant;
