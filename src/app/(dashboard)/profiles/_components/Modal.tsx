import React from 'react';

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
        bg-black bg-opacity-40 backdrop-blur-sm
      "
    >
      <div
        className="
          custom-scrollbar bg-white shadow-lg rounded-lg 
          px-4 py-4 min-w-[450px] max-h-[90vh] overflow-y-auto relative
          animate-[fadeIn_0.15s_ease-out]
        "
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
