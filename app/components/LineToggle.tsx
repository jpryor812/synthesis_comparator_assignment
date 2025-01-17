'use client';

import React from 'react';

interface LineToggleProps {
  mode: 'show' | 'draw';
  onModeChange: (mode: 'show' | 'draw') => void;
}

const LineToggle: React.FC<LineToggleProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex gap-2 bg-gray-900 p-2 rounded-lg">
      <button
        onClick={() => onModeChange('show')}
        className={`px-4 py-2 rounded-md transition-colors ${
          mode === 'show'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        Show Lines
      </button>
      <button
        onClick={() => onModeChange('draw')}
        className={`px-4 py-2 rounded-md transition-colors ${
          mode === 'draw'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        Draw Lines
      </button>
    </div>
  );
};

export default LineToggle;