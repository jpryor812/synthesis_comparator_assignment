import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLongPress } from '../hooks/useLongPress';

interface BlockProps {
  index: number;
  isNew?: boolean;
  onAnimationComplete?: () => void;
  onRemove?: () => void;
  isPopping?: boolean;
  flashState?: 'none' | 'correct' | 'incorrect';
}

export const Block: React.FC<BlockProps> = ({ 
    index, 
    isNew = false, 
    onAnimationComplete,
    onRemove,
    isPopping = false,
    flashState = 'none'
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
                x: isHolding ? [-2, 2, -2] : 0,
                backgroundColor: flashState === 'correct' 
                    ? ['rgb(14 165 233)', 'rgb(134 239 172)', 'rgb(14 165 233)']
                    : flashState === 'incorrect'
                    ? ['rgb(14 165 233)', 'rgb(253 224 71)', 'rgb(14 165 233)']
                    : 'rgb(14 165 233)'
            }}
            transition={{
                y: {
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                    duration: isNew ? 0.3 : 0
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
                },
                backgroundColor: {
                    duration: 1,
                    repeat: flashState !== 'none' ? 1 : 0,
                    ease: "easeInOut"
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
                scale: isPopping ? 2.5 : 0.2,
                transition: {
                    duration: isPopping ? 0.2 : 0.2,
                    ease: isPopping ? "easeOut" : "easeInOut",
                    scale: {
                        duration: isPopping ? 0.2 : 0.2,
                        ease: "backOut"
                    }
                }
            }}
            className={`w-12 h-12 rounded-lg mb-1 bg-gradient-to-br from-sky-300 via-sky-400 to-sky-500 
                       shadow-lg border border-sky-400 backdrop-blur-sm
                       flex items-center justify-center cursor-pointer
                       hover:brightness-110 transition-[filter]
                       ${flashState === 'correct' ? 'animate-flash-green' : ''}
                       ${flashState === 'incorrect' ? 'animate-flash-yellow' : ''}`}
        />
    );
};