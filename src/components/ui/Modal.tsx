"use client";
import React from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center 
        bg-black/40 backdrop-blur-sm 
        animate-fadeIn
        p-3 sm:p-4
      "
    >
      <div
        className="
          bg-white 
          rounded-2xl 
          shadow-[0_8px_24px_rgba(0,0,0,0.08)]
          border border-[#eee]

          /* RESPONSIVE WIDTH */
          w-[95%] 
          sm:w-[480px]
          md:w-[550px]
          lg:w-[600px]

          /* RESPONSIVE PADDING */
          px-4 py-5
          sm:px-6 sm:py-6
          md:px-7 md:py-7

          max-h-[90vh] 
          overflow-y-auto 
          relative
          animate-slideUp
        "
      >
        {/* Close Button */}
        <button
          className="
            absolute top-3 right-3 
            text-gray-500 hover:text-gray-700 
            text-2xl font-bold 
            transition
          "
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        {children}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
