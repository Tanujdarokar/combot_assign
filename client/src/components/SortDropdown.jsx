import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const sortOptions = [
  { label: 'Most Upvoted', value: 'votes' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most Discussed', value: 'comments' }
];

export const SortDropdown = ({ selectedSort, onSelectSort }) => {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
      <ArrowUpDown className="w-4 h-4 text-gray-400" />
      <select
        value={selectedSort}
        onChange={(e) => onSelectSort(e.target.value)}
        className="bg-transparent text-xs font-medium text-gray-700 outline-none cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
