import React from 'react';

const statuses = ['All', 'Under Review', 'Planned', 'In Progress', 'Completed'];

export const StatusFilter = ({ selectedStatus, onSelectStatus }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onSelectStatus(status)}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition ${
            selectedStatus === status
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
};
