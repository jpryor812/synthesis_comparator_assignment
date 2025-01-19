'use client';

import React, { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSound } from '../hooks/useSound';
import ControlPanel from './ControlPanel';
import LineToggle from './LineToggle';
import { BlockStack } from './BlockStack';
import TutorialInstructions from './TutorialInstructions';

export type BlockKey = `left-${number}` | `right-${number}`;
type Side = 'left' | 'right';
type FlashState = 'none' | 'correct' | 'incorrect';


const BlockContainer = () => {
  const [leftCount, setLeftCount] = useState<number>(5);
  const [rightCount, setRightCount] = useState<number>(5);
  const [isLeftDispensing, setIsLeftDispensing] = useState<boolean>(false);
  const [isRightDispensing, setIsRightDispensing] = useState<boolean>(false);
  const [newBlockIndices, setNewBlockIndices] = useState<Record<BlockKey, number>>({});
  const [poppingBlocks, setPoppingBlocks] = useState<Record<string, boolean>>({});
  const [lineMode, setLineMode] = useState<'show' | 'draw'>('show');
  const [flashState, setFlashState] = useState<FlashState>('none');
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  const ComparisonLines = dynamic(() => 
    import('./ComparisonLines').then(mod => mod.ComparisonLines), {
      ssr: false
  });
  
  const CenterComparator = dynamic(() => 
    import('./CenterComparator').then(mod => mod.default), {
      ssr: false
  });

  const handleCorrectAnswer = () => {
    playStackSound(10);
    const flashDuration = 1000;
    setFlashState('correct');
    setTimeout(() => setFlashState('none'), flashDuration);
  };
  
  const handleIncorrectAnswer = () => {
    playStackSound(1); 
    const flashDuration = 1000;
    setFlashState('incorrect');
    setTimeout(() => setFlashState('none'), flashDuration);
  };
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
      const newIndices = { ...prev };
      delete newIndices[key];
      return newIndices;
    });
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
        const newBlocks = { ...prev };
        delete newBlocks[key];
        return newBlocks;
      });
    }, 300);
  }, []);

  const handleControlPanelChange = useCallback((side: Side, newCount: number) => {
    const currentCount = side === 'left' ? leftCount : rightCount;
    
    if (newCount > currentCount) {
        const blocksToAdd = newCount - currentCount;
        let added = 0;
        
        const addNextBlock = () => {
            if (added < blocksToAdd) {
                addBlock(side);
                added++;
                setTimeout(addNextBlock, 200);
            }
        };
        
        addNextBlock();
    } else if (newCount < currentCount) {
        const removeBlocksSequentially = (remainingBlocks: number) => {
            if (remainingBlocks > newCount) {
                if (side === 'left') {
                    setLeftCount(remainingBlocks - 1);
                } else {
                    setRightCount(remainingBlocks - 1);
                }
                
                // Then trigger block removal animation
                removeBlock(side, remainingBlocks - 1, false);
                
                setTimeout(() => {
                    removeBlocksSequentially(remainingBlocks - 1);
                }, 300);
            }
        };
        
        removeBlocksSequentially(currentCount);
    }
}, [leftCount, rightCount, addBlock, removeBlock]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">

      
    <div className="flex justify-between items-stretch gap-4 relative">
      <CenterComparator 
        leftCount={leftCount} 
        rightCount={rightCount}
        leftStackRef={leftStackRef}
        rightStackRef={rightStackRef}
        onCorrectAnswer={handleCorrectAnswer}
        onIncorrectAnswer={handleIncorrectAnswer}
      />

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
          flashState={flashState}
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
          flashState={flashState}
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

      {showTutorial && (
        <TutorialInstructions 
          onComplete={() => setShowTutorial(false)}
        />
      )}

      <div className="flex justify-center">
        <LineToggle mode={lineMode} onModeChange={setLineMode} />
      </div>
    </div>
  );
};

export default BlockContainer;