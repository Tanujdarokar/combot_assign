import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-lg transition-all animate-bounce-in">
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
      )}
      <p className="text-sm font-medium text-gray-800">{message}</p>
      <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
