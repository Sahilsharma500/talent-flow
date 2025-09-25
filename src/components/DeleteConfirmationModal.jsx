import React from "react";

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-indigo-300 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-indigo-700">Delete Job</h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete "<span className="font-medium">{jobTitle}</span>"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 cursor-pointer bg-indigo-100 hover:bg-indigo-200 rounded text-indigo-700 hover:text-indigo-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
