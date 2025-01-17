'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface ControlPanelProps {
  onNumberChange: (number: number) => void;
  currentBlocks?: number;
  maxBlocks?: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onNumberChange, currentBlocks = 0, maxBlocks = 10 }) => {
  const [displayValue, setDisplayValue] = useState(currentBlocks);

  useEffect(() => {
    setDisplayValue(currentBlocks);
  }, [currentBlocks]);

  const handleNumberClick = (number: number) => {
    if (number <= maxBlocks) {
      setDisplayValue(number);
      onNumberChange(number);
    }
  };

  const handlePlusMinus = (increment: number) => {
    const newValue = displayValue + increment;
    if (newValue >= 0 && newValue <= maxBlocks) {
      setDisplayValue(newValue);
      onNumberChange(newValue);
    }
  };

  return (
    <div className="bg-purple-500 rounded-xl p-3.5 w-48 shadow-xl">
      {/* Display */}
      <div className="bg-white border-2 border-orange-400 rounded-lg p-3 mb-3">
        <div className="text-blue-400 text-2xl font-mono text-right">
          {displayValue}
        </div>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
          <button
            key={number}
            onClick={() => handleNumberClick(number)}
            className={`
              p-2.5 text-base font-semibold rounded-lg
              ${number === 10 ? 'col-span-3' : ''}
              bg-gradient-to-br from-blue-600 to-blue-800
              hover:from-blue-500 hover:to-blue-700
              active:from-blue-700 active:to-blue-900
              text-white transition-colors duration-150
              ${currentBlocks === number ? 'ring-2 ring-blue-300' : ''}
            `}
          >
            {number}
          </button>
        ))}
      </div>

      {/* Plus/Minus Controls */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handlePlusMinus(-1)}
          className="p-2.5 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700
                     text-white flex items-center justify-center"
          disabled={displayValue <= 0}
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={() => handlePlusMinus(1)}
          className="p-2.5 rounded-lg bg-green-600 hover:bg-green-500 active:bg-green-700
                     text-white flex items-center justify-center"
          disabled={displayValue >= maxBlocks}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;