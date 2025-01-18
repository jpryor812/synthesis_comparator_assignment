'use client';

import React, { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Block } from './Block';
import { Dispenser } from './Dispenser';
import { useSound } from '../hooks/useSound';
import ControlPanel from './ControlPanel';
import LineToggle from './LineToggle';
import { BlockStack } from './BlockStack';
import { ComparisonLines } from './ComparisonLines';

export type BlockKey = `left-${number}` | `right-${number}`;
type Side = 'left' | 'right';

const BlockContainer = () => {
  const [leftCount, setLeftCount] = useState<number>(5);
  const [rightCount, setRightCount] = useState<number>(5);
  const [isLeftDispensing, setIsLeftDispensing] = useState<boolean>(false);
  const [isRightDispensing, setIsRightDispensing] = useState<boolean>(false);
  const [newBlockIndices, setNewBlockIndices] = useState<Record<BlockKey, number>>({});
  const [poppingBlocks, setPoppingBlocks] = useState<Record<string, boolean>>({});
  const [lineMode, setLineMode] = useState<'show' | 'draw'>('show');

  const { playStackSound } = useSound();

  const leftStackRef = useRef<HTMLDivElement>(null);
  const rightStackRef = useRef<HTMLDivElement>(null);

  const addBlock = useCallback((side: Side) => {
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

  const handleBlockAnimationComplete = (key: BlockKey): void => {
    setNewBlockIndices(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    playStackSound(parseInt(key.split('-')[1]));
  };

  const removeBlock = useCallback((side: Side, index: number, shouldUpdateCount = true) => {
    const key = `${side}-${index}`;
    setPoppingBlocks(prev => ({ ...prev, [key]: true }));
    
    setTimeout(() => {
      setNewBlockIndices(prev => {
        const updated: Record<BlockKey, number> = {};
        Object.entries(prev).forEach(([k, v]) => {
          const [blockSide, blockIndex] = k.split('-');
          if (blockSide === side && parseInt(blockIndex) > index) {
            updated[`${blockSide}-${parseInt(blockIndex) - 1}` as BlockKey] = v;
          } else if (blockSide === side && parseInt(blockIndex) < index) {
            updated[k as BlockKey] = v;
          }
        });
        return updated;
      });

      if (shouldUpdateCount) {
        if (side === 'left') {
          setLeftCount(prev => prev - 1);
        } else {
          setRightCount(prev => prev - 1);
        }
      }

      setPoppingBlocks(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }, 300);
  }, []);

  const handleControlPanelChange = useCallback((side: Side, newCount: number) => {
    const currentCount = side === 'left' ? leftCount : rightCount;
    
    if (newCount > currentCount) {
      // Add multiple blocks sequentially
      const blocksToAdd = newCount - currentCount;
      let added = 0;
      
      const addNextBlock = () => {
        if (added < blocksToAdd) {
          addBlock(side);
          added++;
          setTimeout(addNextBlock, 200); // Delay between each block
        }
      };
      
      addNextBlock();
    } else if (newCount < currentCount) {
        // Remove blocks sequentially with immediate count update
        const blocksToRemove = currentCount - newCount;
        
        // Update the count immediately
        if (side === 'left') {
          setLeftCount(newCount);
        } else {
          setRightCount(newCount);
        }
        
        // Then animate the removals
        for (let i = 0; i < blocksToRemove; i++) {
          const indexToRemove = currentCount - 1 - i;
          setTimeout(() => {
            removeBlock(side, indexToRemove, false); // Pass false to prevent additional count updates
          }, i * 200); // Stagger the removals
        }
      }
  }, [leftCount, rightCount, addBlock, removeBlock]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">
      <div className="flex justify-between items-stretch gap-4 relative">
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-lg text-gray-600 font-medium z-10">
          Click blocks to remove them
        </div>

        {/* Left Control Panel */}
        <div className="flex-none self-center">
          <ControlPanel 
            onNumberChange={(number) => handleControlPanelChange('left', number)} 
            currentBlocks={leftCount}
            maxBlocks={10}
          />
        </div>

        <BlockStack
          side="left"
          count={leftCount}
          isDispensing={isLeftDispensing}
          newBlockIndices={newBlockIndices}
          poppingBlocks={poppingBlocks}
          onDispenserComplete={() => setIsLeftDispensing(false)}
          onAddBlock={() => addBlock('left')}
          onRemoveBlock={(index) => removeBlock('left', index)}
          onAnimationComplete={handleBlockAnimationComplete}
          stackRef={leftStackRef}
        />

        <BlockStack
          side="right"
          count={rightCount}
          isDispensing={isRightDispensing}
          newBlockIndices={newBlockIndices}
          poppingBlocks={poppingBlocks}
          onDispenserComplete={() => setIsRightDispensing(false)}
          onAddBlock={() => addBlock('right')}
          onRemoveBlock={(index) => removeBlock('right', index)}
          onAnimationComplete={handleBlockAnimationComplete}
          stackRef={rightStackRef}
        />

        {/* Right Control Panel */}
        <div className="flex-none self-center">
          <ControlPanel 
            onNumberChange={(number) => handleControlPanelChange('right', number)} 
            currentBlocks={rightCount}
            maxBlocks={10}
          />
        </div>

        <ComparisonLines
          leftStackRef={leftStackRef}
          rightStackRef={rightStackRef}
          leftCount={leftCount}
          rightCount={rightCount}
          lineMode={lineMode}
        />
      </div>

      <div className="flex justify-center">
        <LineToggle mode={lineMode} onModeChange={setLineMode} />
      </div>
    </div>
  );
};

export default BlockContainer;