import React from "react";

const LoaderSkeleton = () => {
  return (
    <>
      <tr>
        <td className="border-t-0 px-4 border align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
          <div className="flex items-center">
            <div className="w-8 bg-gray-300 h-8 rounded-full animate-pulse "></div>
            <div className="ml-2 text-gray-800 w-9 rounded-md h-5 bg-gray-300 animate-pulse"></div>
          </div>
        </td>
        <td className="border-t-0 px-4 border align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
          <div className="text-base font-medium  bg-gray-300 animate-pulse w-16 h-5 rounded-md text-gray-800"></div>
          <div className="text-sm mt-1 bg-gray-300 animate-pulse w-16 h-5 rounded-md "></div>
        </td>
        <td className="border-t-0 px-4 border  align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 ">
          <div className="text-base bg-gray-300 animate-pulse w-9 h-5 rounded-md"></div>
        </td>
        <td className="border-t-0 px-4 border  align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
          <div className="text-base bg-gray-300 animate-pulse w-16 h-5 rounded-md"></div>
        </td>
        <td className="border-t-0 px-4 border align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
          <div className="h-8 rounded-md w-16 animate-pulse ml-2 bg-gray-300"></div>
        </td>
      </tr>
    </>
  );
};

export default LoaderSkeleton;
