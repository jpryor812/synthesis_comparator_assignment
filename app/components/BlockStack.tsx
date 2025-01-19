'use client';

import { Dispenser } from './Dispenser';
import { Block } from './Block';
import { AnimatePresence, motion } from 'framer-motion';
import { type BlockKey } from './BlockContainer';
import { AddButton } from './AddButton';
import { useState, useEffect } from 'react';

interface BlockStackProps {
  side: 'left' | 'right';
  count: number;
  isDispensing: boolean;
  newBlockIndices: Record<string, number>;
  poppingBlocks: Record<string, boolean>;
  onDispenserComplete: () => void;
  onAddBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onAnimationComplete: (key: BlockKey) => void;
  stackRef: React.RefObject<HTMLDivElement | null>; 
  flashState?: 'none' | 'correct' | 'incorrect';
}

export const BlockStack: React.FC<BlockStackProps> = ({
  side,
  count,
  isDispensing,
  newBlockIndices,
  poppingBlocks,
  onDispenserComplete,
  onAddBlock,
  onRemoveBlock,
  onAnimationComplete,
  stackRef,
  flashState,
}) => {
  const [shouldBounce, setShouldBounce] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  const containerRef = (node: HTMLDivElement | null) => {
    if (stackRef && typeof stackRef === 'object') {
      stackRef.current = node;
    }
  };

  useEffect(() => {
    setShouldBounce(false);
    setLastActivityTime(Date.now());
  }, [count, isDispensing, Object.keys(newBlockIndices).length, Object.keys(poppingBlocks).length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastActivityTime >= 2000) {
        setShouldBounce(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [lastActivityTime]);

  const bounceVariants = {
    bounce: {
      y: [0, 8, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    still: {
      y: 0
    }
  };

  return (
    <div className="flex-1 rounded-xl p-2 h-[700px] relative -mt-6
                  backdrop-blur-sm
                  flex flex-col items-center">
      <Dispenser 
        isDispensing={isDispensing}
        onAnimationComplete={onDispenserComplete}
        side={side}
      />
<AddButton 
  onClick={onAddBlock}
  disabled={count >= 10}
  isFull={count >= 10}
  className={`absolute top-16 ${side === 'left' ? 'right-24' : 'left-24'}`}
/>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%]">
        <motion.div 
          ref={containerRef} 
          className="flex flex-col-reverse relative"
          data-block-count={count}
          data-stack-side={side}
          animate={shouldBounce ? "bounce" : "still"}
          variants={bounceVariants}
        >
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 
                      text-3xl font-semibold text-sky-600 whitespace-nowrap">
            {count}
          </div>
          <AnimatePresence mode="popLayout">
            {Array(count).fill(null).map((_, index) => (
              <Block 
                key={`${side}-${index}`} 
                index={index}
                isNew={`${side}-${index}` in newBlockIndices}
                isPopping={`${side}-${index}` in poppingBlocks}
                onRemove={() => onRemoveBlock(index)}
                onAnimationComplete={() => {
                  requestAnimationFrame(() => {
                    onAnimationComplete(`${side}-${index}`);
                  });
                }}
                flashState={flashState}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};