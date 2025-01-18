'use client';

import { Dispenser } from './Dispenser';
import { Block } from './Block';
import { AnimatePresence } from 'framer-motion';
import { type BlockKey } from './BlockContainer';
import { AddButton } from './AddButton';

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
        className={`absolute top-16 ${side === 'left' ? '-right-24' : '-left-24'}`}
      />

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
              flashState={flashState}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}; 