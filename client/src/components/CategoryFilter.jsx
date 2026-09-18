import React from 'react';

const categories = ['All', 'UI/UX', 'Integrations', 'Performance', 'General'];

export const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition ${
            selectedCategory === category
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
