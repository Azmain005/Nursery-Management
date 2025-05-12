import { AiFillPhone, AiOutlineEnvironment } from "react-icons/ai";
import { HiOutlineMail } from "react-icons/hi";
import {
  IoLogoFacebook,
  IoLogoGithub,
  IoLogoInstagram,
  IoLogoLinkedin,
} from "react-icons/io";
import { Link } from "react-router-dom";
import footer from "../../assets/footer.png";

const Footer = () => {
  return (
    <div
      className="
        w-full
        bg-[#faf6e9]
        border-t-2 border-[#3e5931]
        px-4 py-10
        gap-5
        flex flex-col items-center
        md:flex-row md:flex-wrap md:gap-5 md:justify-evenly md:items-start md:py-20 md:px-10
        text-[#3e5931]
        bg-contain
      "
      style={{
        backgroundImage: `url(${footer})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="flex flex-col items-start border-none rounded-xl bg-[#9bab9a]/60 backdrop-blur-md backdrop-filter p-4 w-full max-w-[244px] h-auto min-h-[300px] md:h-[403px]">
        <h1 className="text-xl md:text-2xl mb-3 md:mb-5">Planty</h1>
        <p className="text-sm md:text-base">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam,
          quos?Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quia,
          a!l Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet
          maiores, unde a magni iusto sequi et obcaecati dignissimos iste ipsam.
        </p>
      </div>

      {/* 2nd */}
      <div className="flex flex-col justify-between items-start border-none rounded-xl bg-[#607b64]/90 backdrop-blur-md backdrop-filter text-white p-4 w-full max-w-[244px] h-auto min-h-[300px] md:h-[403px]">
        <div className="flex flex-col items-start">
          <h1 className="text-xl md:text-2xl mb-3 md:mb-5">Contact Us</h1>

          <div className="mb-2 md:mb-3">
            <div className="flex gap-1 items-center justify-center hover:text-black cursor-pointer">
              <AiOutlineEnvironment className="text-lg md:text-xl" />
              <p className="text-xs md:text-sm">BRAC University</p>
            </div>
          </div>

          <div className="mb-2 md:mb-3">
            <div className="flex gap-1 items-center justify-center hover:text-black cursor-pointer">
              <AiFillPhone className="text-lg md:text-xl" />
              <p className="text-xs md:text-sm">01718740241</p>
            </div>
          </div>

          <div className="mb-2 md:mb-3">
            <div className="flex gap-1 items-center justify-center hover:text-black cursor-pointer">
              <HiOutlineMail className="text-lg md:text-xl" />
              <p className="text-xs md:text-sm">gachlagan@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between w-2/3 h-[30px] md:h-[40px] text-[20px] md:text-[25px] items-end mt-4 md:mt-0">
          <Link className="hover:text-black">
            <IoLogoFacebook />
          </Link>
          <Link className="hover:text-black">
            <IoLogoLinkedin />
          </Link>
          <Link className="hover:text-black">
            <IoLogoGithub />
          </Link>
          <Link className="hover:text-black">
            <IoLogoInstagram />
          </Link>
        </div>
      </div>

      {/* 3rd */}
      <div className="flex flex-col items-start border-none rounded-xl bg-[#607b64]/80 backdrop-blur-md backdrop-filter p-4 w-full max-w-[244px] h-auto min-h-[300px] md:h-[403px] text-white text-xs md:text-sm">
        <h1 className="text-xl md:text-2xl mb-2 border-b-2 w-full pb-1">Categories</h1>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Fresh Fruits
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Bonsai Plants
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Botanical
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Office Plant
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Organic
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Seasonal Plants
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Special Plants
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Vegetables
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Latest
        </p>
      </div>
      {/* 4th */}
      <div className="flex flex-col items-start border-none rounded-xl bg-[#607b64]/80 backdrop-blur-md backdrop-filter p-4 w-full max-w-[244px] h-auto min-h-[200px] md:h-[403px] text-white text-xs md:text-sm">
        <h1 className="text-xl md:text-2xl mb-2 border-b-2 w-full pb-1">Services</h1>

        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          About Us
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Contact Us
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Privacy Policy
        </p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">
          Delivery Information
        </p>
      </div>
    </div>
  );
};

export default Footer;