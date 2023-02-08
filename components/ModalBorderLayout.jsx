import React from "react";

const ModalBorderLayout = ({ isVisible, onClose, children }) => {
  if (!isVisible) return null;

  const handleClose = (e) => {
    if (e.target.id === "supplyWrapper") onClose();
  };
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[1px] flex justify-center items-center"
      id="supplyWrapper"
      onClick={handleClose}
    >
      <div className="w-[380px]">
        <div
          className="bg-[#292E41] text-[#F1F1F3] p-6 rounded
        "
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalBorderLayout;
