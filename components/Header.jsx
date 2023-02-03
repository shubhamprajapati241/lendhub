import React from "react";

const Header = () => {
  return (
    <nav className="w-full h-15 text-white flex py-2 px-4 lg:px-10 justify-between items-center border-b-2 border-gray-400">
      {/* Brand */}
      <a href="/" className="font-semibold text-md">
        LendHub
      </a>

      {/* Connect Button */}
      <button className="border-spacing-2 bg-slate-200 px-4 py-1 rounded-md text-black text-md font-semibold">
        Connect
      </button>
    </nav>
  );
};

export default Header;
