'use client';

import { Dispenser } from './Dispenser';
import { Block } from './Block';
import { AnimatePresence } from 'framer-motion';
import { type BlockKey } from './BlockContainer';

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
}) => {
  return (
    <div className="flex-1 rounded-xl p-2 h-[700px] relative -mt-6
                  backdrop-blur-sm
                  flex flex-col items-center">
      <Dispenser 
        isDispensing={isDispensing}
        onAnimationComplete={onDispenserComplete}
        side={side}
      />
      <button 
        onClick={onAddBlock}
        className={`absolute top-16 ${side === 'left' ? 'right-8' : 'left-8'} px-4 py-1 bg-blue-500 text-white rounded-lg
                   hover:bg-blue-600 transition-colors`}
      >
        Add a Block!
      </button>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%]">
        <div ref={stackRef} className="flex flex-col-reverse relative">
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 
                      text-3xl font-semibold text-sky-600 whitespace-nowrap">
            {count}
          </div>
          <AnimatePresence>
            {Array(count).fill(null).map((_, index) => (
              <Block 
                key={`${side}-${index}`} 
                index={index}
                isNew={`${side}-${index}` in newBlockIndices}
                isPopping={`${side}-${index}` in poppingBlocks}
                onRemove={() => onRemoveBlock(index)}
                onAnimationComplete={() => onAnimationComplete(`${side}-${index}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}; 