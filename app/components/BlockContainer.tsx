'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface BlockProps {
  index: number;
  isNew?: boolean;
  onAnimationComplete?: () => void;
  onRemove?: () => void;
  isPopping?: boolean;
}

interface DispenserProps {
  isDispensing: boolean;
  onAnimationComplete?: () => void;
  side: 'left' | 'right';
}

//Long Press for popping blocks
const useLongPress = (onLongPress: () => void, duration = 500) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
    const start = useCallback(() => {
      timeoutRef.current = setTimeout(() => {
        onLongPress();
      }, duration);
    }, [onLongPress, duration]);
  
    const stop = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }, []);
  
    return {
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop,
    };
  };

// Sound management
const useSound = () => {
  const [audio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audioContext = new AudioContext();
      return audioContext;
    }
    return null;
  });

  const playStackSound = useCallback((index: number) => {
    if (!audio) return;
    
    const oscillator = audio.createOscillator();
    const gainNode = audio.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audio.destination);
    
    oscillator.frequency.value = 200 + (index * 50);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audio.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audio.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audio.currentTime + 0.2);
    
    oscillator.start(audio.currentTime);
    oscillator.stop(audio.currentTime + 0.2);
  }, [audio]);

  return { playStackSound };
};

// Dispenser Component
const Dispenser: React.FC<DispenserProps> = ({ isDispensing, onAnimationComplete, side }) => {
  const [blocks, setBlocks] = useState([0, 1]); // Track block IDs for animation
  
  useEffect(() => {
    if (isDispensing) {
      // After block drops, add a new one at the top
      setTimeout(() => {
        setBlocks(prev => [Math.max(...prev) + 1, prev[0]]);
      }, 200);
    }
  }, [isDispensing]);

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-28">
      {/* Container outline - no top border */}
      <div className="absolute inset-x-0 bottom-0 border-2 border-t-0 border-orange-400 rounded-b-lg overflow-hidden h-[90%]" />
      
      {/* Queued blocks */}
      <div className="absolute inset-x-2">
  <AnimatePresence>
    {blocks.map((id, index) => (
      <motion.div
        key={id}
        initial={{ y: index * 56 }} // Adjust block spacing
        animate={{ y: index * 56 }} // Keep blocks stacked vertically
        exit={{ y: index * 48 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 400,
        }}
        className="absolute w-12 h-12 rounded bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 
                   shadow-lg border border-blue-400"
      />
    ))}
  </AnimatePresence>
</div>


      {/* Bottom sliding door */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-2 bg-orange-400"
        animate={{ 
          x: isDispensing ? (side === 'left' ? -96 : 96) : 0 
        }}
        transition={{ duration: 0.15 }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
};

// Block Component
const Block: React.FC<BlockProps> = ({ 
    index, 
    isNew = false, 
    onAnimationComplete,
    onRemove,
    isPopping = false 
  }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [hasLanded, setHasLanded] = useState(!isNew);
  
  const longPressProps = useLongPress(
    () => {
      if (onRemove) {
        setIsHolding(false);
        onRemove();
      }
    },
    500
  );

  const enhancedProps = {
    ...longPressProps,
    onMouseDown: () => {
      setIsHolding(true);
      longPressProps.onMouseDown();
    },
    onMouseUp: () => {
      setIsHolding(false);
      longPressProps.onMouseUp();
    },
    onMouseLeave: () => {
      setIsHolding(false);
      longPressProps.onMouseLeave();
    },
    onTouchStart: () => {
      setIsHolding(true);
      longPressProps.onTouchStart();
    },
    onTouchEnd: () => {
      setIsHolding(false);
      longPressProps.onTouchEnd();
    }
  };

  return (
    <motion.div 
      initial={{ 
        opacity: isNew ? 0 : 1, 
        y: isNew ? -100 : 0,
        scale: 1
      }}
      {...enhancedProps}
      animate={{ 
        opacity: 1,
        y: 0,
        scale: isPopping ? 2 : isHolding ? 1.1 : 1,
        rotate: isHolding ? [-1, 1, -1] : 0,
        x: isHolding ? [-2, 2, -2] : 0
      }}
      transition={{
        y: {
          type: "spring",
          damping: 20,
          stiffness: 300,
          duration: isNew ? 0.5 : 0
        },
        scale: { 
          duration: isPopping ? 0.2 : 0.2 
        },
        rotate: {
          repeat: isHolding ? Infinity : 0,
          duration: 0.3
        },
        x: {
          repeat: isHolding ? Infinity : 0,
          duration: 0.2
        }
      }}
      onAnimationComplete={() => {
        if (!hasLanded && isNew) {
          setHasLanded(true);
          if (onAnimationComplete) onAnimationComplete();
        }
      }}
      exit={{ 
        opacity: 0, 
        scale: isPopping ? 2.5 : 0.3,
        transition: {
          duration: isPopping ? 0.3 : 0.2,
          ease: isPopping ? "easeOut" : "easeInOut",
          scale: {
            duration: isPopping ? 0.3 : 0.2,
            ease: "backOut"
          }
        }
      }}
      className="w-12 h-12 rounded-lg mb-1 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 
                 shadow-lg border border-blue-400 backdrop-blur-sm
                 flex items-center justify-center cursor-pointer
                 hover:brightness-110 transition-[filter]"
    />
  );
};
// Main Container Component
const BlockContainer = () => {
  const [leftCount, setLeftCount] = useState(3);
  const [rightCount, setRightCount] = useState(2);
  const [isLeftDispensing, setIsLeftDispensing] = useState(false);
  const [isRightDispensing, setIsRightDispensing] = useState(false);
  const [newBlockIndices, setNewBlockIndices] = useState<Record<string, number>>({});
  const [poppingBlocks, setPoppingBlocks] = useState<Record<string, boolean>>({});

  
  const { playStackSound } = useSound();

  const addBlock = useCallback((side: 'left' | 'right') => {
    if (side === 'left' && isLeftDispensing) return;
    if (side === 'right' && isRightDispensing) return;

    setNewBlockIndices(prev => ({
      ...prev,
      [`${side}-${side === 'left' ? leftCount : rightCount}`]: Date.now()
    }));
    
    if (side === 'left') {
      setIsLeftDispensing(true);
      setTimeout(() => setLeftCount(prev => prev + 1), 300);
    } else {
      setIsRightDispensing(true);
      setTimeout(() => setRightCount(prev => prev + 1), 300);
    }
  }, [leftCount, rightCount, isLeftDispensing, isRightDispensing]);

  const handleBlockAnimationComplete = (key: string) => {
    setNewBlockIndices(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    playStackSound(parseInt(key.split('-')[1]));
  };

  const removeBlock = useCallback((side: 'left' | 'right', index: number) => {
    const key = `${side}-${index}`;
    setPoppingBlocks(prev => ({ ...prev, [key]: true }));
    
    // Wait for pop animation to complete before removing block
    setTimeout(() => {
        if (side === 'left') {
          setLeftCount(prev => {
            // Create new array without the removed block
            const newBlocks = Array(prev).fill(null)
              .filter((_, i) => i !== index);
            return newBlocks.length;
          });
        } else {
          setRightCount(prev => {
            // Create new array without the removed block
            const newBlocks = Array(prev).fill(null)
              .filter((_, i) => i !== index);
            return newBlocks.length;
          });
        }
        setPoppingBlocks(prev => {
          const { [key]: _, ...rest } = prev;
          return rest;
        });
      }, 200);
    }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between gap-12">
        {/* Left Container */}
        <div className="flex-1 rounded-xl p-6 min-h-[800px] relative -mt-6
                      backdrop-blur-sm
                      flex flex-col items-center">
          <Dispenser 
            isDispensing={isLeftDispensing}
            onAnimationComplete={() => setIsLeftDispensing(false)}
            side="left"
          />
          <button 
            onClick={() => addBlock('left')}
            className="mb-4 px-4 py-1 bg-blue-500 text-white rounded-lg
                       hover:bg-blue-600 transition-colors"
          >
            Dispense Block
          </button>
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
            <div className="flex flex-col-reverse">
              <AnimatePresence>
                {Array(leftCount).fill(null).map((_, index) => (
                  <Block 
                    key={`left-${index}`} 
                    index={index}
                    isNew={`left-${index}` in newBlockIndices}
                    isPopping={`left-${index}` in poppingBlocks}
                    onRemove={() => removeBlock('left', index)}
                    onAnimationComplete={() => handleBlockAnimationComplete(`left-${index}`)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Container */}
        <div className="flex-1 rounded-xl p-6 min-h-[800px] relative -mt-6
                      backdrop-blur-sm
                      flex flex-col items-center">
          <Dispenser 
            isDispensing={isRightDispensing}
            onAnimationComplete={() => setIsRightDispensing(false)}
            side="right"
          />
          <button 
            onClick={() => addBlock('right')}
            className="mb-4 px-4 py-1 bg-blue-500 text-white rounded-lg
                       hover:bg-blue-600 transition-colors"
          >
            Dispense Block
          </button>
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
            <div className="flex flex-col-reverse">
              <AnimatePresence>
                {Array(rightCount).fill(null).map((_, index) => (
                  <Block 
                    key={`right-${index}`} 
                    index={index}
                    isNew={`right-${index}` in newBlockIndices}
                    isPopping={`right-${index}` in poppingBlocks}
                    onRemove={() => removeBlock('right', index)}
                    onAnimationComplete={() => handleBlockAnimationComplete(`right-${index}`)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockContainer;