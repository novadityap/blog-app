const Footer = () => {
  return (
    <footer className="border-t-2 p-6 bg-white shadow-md mt-4">
      <p className="text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Aditya&apos;s Blog. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
