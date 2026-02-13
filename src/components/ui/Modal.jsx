import React, { useEffect } from 'react';

const Modal = ({ open, onClose, title, contentClassName, children }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={`relative w-full rounded-2xl bg-white shadow-xl border border-gray-200 p-6 ${contentClassName ?? 'max-w-md'}`}>
        {title && <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
