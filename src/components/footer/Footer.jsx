const Footer = () => {
  return (
    <div className="w-full bg-green-200 text-center p-4 mt-10">
      <div className="text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Your Company Name. All rights reserved.
      </div>
      <div className="text-sm text-gray-600">
        <a href="/privacy-policy" className="hover:text-green-500">Privacy Policy</a> | 
        <a href="/terms-of-service" className="hover:text-green-500"> Terms of Service</a>
      </div>

    </div>
  );
};

export default Footer;
