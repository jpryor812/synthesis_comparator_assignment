'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CenterComparatorProps {
  leftCount: number;
  rightCount: number;
  leftStackRef: React.RefObject<HTMLDivElement | null>;
  rightStackRef: React.RefObject<HTMLDivElement | null>;
  onCorrectAnswer: () => void;
  onIncorrectAnswer: () => void;
}

const CenterComparator: React.FC<CenterComparatorProps> = ({
  leftCount,
  rightCount,
  onCorrectAnswer,
  onIncorrectAnswer
}) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const checkAnswer = (answer: '<' | '=' | '>') => {
    let correct = false;
    
    switch(answer) {
      case '<':
        correct = leftCount < rightCount;
        break;
      case '=':
        correct = leftCount === rightCount;
        break;
      case '>':
        correct = leftCount > rightCount;
        break;
    }
  
    if (correct) {
      setIsCorrect(true);
      onCorrectAnswer();
      setTimeout(() => {
        setIsCorrect(null);
      }, 1000);
    } else {
      setIsCorrect(false);
      onIncorrectAnswer();
      setTimeout(() => {
        setIsCorrect(null);
      }, 1000);
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
    {isCorrect === true && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute bg-green-500 text-white text-6xl font-bold p-4 rounded-lg shadow-lg"
      >
        Correct!
      </motion.div>
    )}
    {isCorrect === false && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute bg-yellow-500 text-white text-center text-6xl font-bold p-4 rounded-lg shadow-lg"
      >
        Not Quite!
      </motion.div>
    )}

      {/* Left number */}
      <motion.div 
        animate={{
          backgroundColor: isCorrect ? '#86efac' : 'white',
          transition: { duration: 0.3 }
        }}
        className="border-2 border-orange-400 rounded-lg p-1 w-12"
      >
        <div className="text-blue-400 text-2xl font-mono text-center">
          {leftCount}
        </div>
      </motion.div>

      {/* Comparison buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => checkAnswer('<')}
          className={`w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 
                    hover:from-blue-500 hover:to-blue-700 active:from-blue-700 
                    active:to-blue-900 text-white text-2xl font-bold transition-colors
                    ${isCorrect === false ? 'animate-shake' : ''}`}
        >
          &lt;
        </button>
        <button 
          onClick={() => checkAnswer('=')}
          className={`w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 
                    hover:from-blue-500 hover:to-blue-700 active:from-blue-700 
                    active:to-blue-900 text-white text-2xl font-bold transition-colors
                    ${isCorrect === false ? 'animate-shake' : ''}`}
        >
          =
        </button>
        <button 
          onClick={() => checkAnswer('>')}
          className={`w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 
                    hover:from-blue-500 hover:to-blue-700 active:from-blue-700 
                    active:to-blue-900 text-white text-2xl font-bold transition-colors
                    ${isCorrect === false ? 'animate-shake' : ''}`}
        >
          &gt;
        </button>
      </div>

      {/* Right number */}
      <motion.div 
        animate={{
          backgroundColor: isCorrect ? '#86efac' : 'white',
          transition: { duration: 0.3 }
        }}
        className="border-2 border-orange-400 rounded-lg p-1 w-12"
      >
        <div className="text-blue-400 text-2xl font-mono text-center">
          {rightCount}
        </div>
      </motion.div>
    </div>
  );
};

export default CenterComparator;