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
        px-10 py-20 
        flex justify-evenly items-center 
        text-[#3e5931]
        bg-cover 
      "
      style={{
        backgroundImage: `url(${footer}), url(${footer})`,
        backgroundPosition: 'left, right-bottom',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundSize: '40% auto, 40% auto',
      }}
    >
      <div className="flex flex-col items-start border-2 border-[#3e5931] rounded-lg bg-[#9bab9a] p-5 mr-10 w-[244px] h-[403px]">
        <h1 className="text-2xl mb-5">Planty</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam,
          quos?Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quia,
          a!l Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet
          maiores, unde a magni iusto sequi et obcaecati dignissimos iste ipsam.
        </p>
      </div>
      {/* 2nd */}
      <div className="flex flex-col justify-between items-start border-2 border-[#3e5931] rounded-lg bg-[#607b64] text-white p-5 mr-10 w-[244px] h-[403px]">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl mb-5">Contact Us</h1>
          <div className="mb-3">
            <div className="flex gap-1 items-center justify-center hover:text-black cursor-pointer">
              <AiOutlineEnvironment className="text-xl" />
              <p className="text-xs">BRAC University</p>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex gap-1 items-center justify-center hover:text-black cursor-pointer">
              <AiFillPhone className="text-xl" />
              <p className="text-xs">01718740241</p>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex gap-1 items-center justify-center hover:text-black cursor-pointer">
              <HiOutlineMail className="text-xl" />
              <p className="text-xs">gachlagan@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between w-2/3 h-[40px] text-[25px] items-end">
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
      <div className="flex flex-col items-start border-2 border-[#3e5931] rounded-lg bg-[#607b64] p-5 mr-10 w-[244px] h-[403px] text-white text-sm">
        <h1 className="text-2xl mb-2 border-b-2 w-full pb-1">Categories</h1>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Fresh Fruits</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Bonsai Plants</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Botanical</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Office Plant</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Organic</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Seasonal Plants</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Special Plants</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Vegetables</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Latest</p>
        
      </div>
      <div className="flex flex-col items-start border-2 border-[#3e5931] rounded-lg bg-[#607b64] p-5 mr-10 w-[244px] h-[403px] text-white text-sm">
        <h1 className="text-2xl mb-2 border-b-2 w-full pb-1">Services</h1>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">About Us</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Contact Us</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Privacy Policy</p>
        <p className="border-b-2 w-full pb-1 pt-2 hover:translate-x-2 hover:text-black cursor-pointer hover:border-black">Delivery Information</p>
        
      </div>
    </div>
  );
};

export default Footer;
