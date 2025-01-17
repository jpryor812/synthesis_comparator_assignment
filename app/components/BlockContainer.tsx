'use client';

import React, { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Block } from './Block';
import { Dispenser } from './Dispenser';
import { useSound } from '../hooks/useSound';
import ControlPanel from './ControlPanel';
import LineToggle from './LineToggle';

type BlockKey = `left-${number}` | `right-${number}`;

const BlockContainer = () => {
  const [leftCount, setLeftCount] = useState(5);
  const [rightCount, setRightCount] = useState(5);
  const [isLeftDispensing, setIsLeftDispensing] = useState(false);
  const [isRightDispensing, setIsRightDispensing] = useState(false);
  const [newBlockIndices, setNewBlockIndices] = useState<Record<BlockKey, number>>({});
  const [poppingBlocks, setPoppingBlocks] = useState<Record<string, boolean>>({});
  const [lineMode, setLineMode] = useState<'show' | 'draw'>('show');

  const { playStackSound } = useSound();

  const leftStackRef = useRef<HTMLDivElement>(null);
  const rightStackRef = useRef<HTMLDivElement>(null);

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

  const removeBlock = useCallback((side: 'left' | 'right', index: number, shouldUpdateCount = true) => {
    const key = `${side}-${index}`;
    setPoppingBlocks(prev => ({ ...prev, [key]: true }));
    
    setTimeout(() => {
      setNewBlockIndices(prev => {
        const updated = {};
        Object.entries(prev).forEach(([k, v]) => {
          const [blockSide, blockIndex] = k.split('-');
          if (blockSide === side && parseInt(blockIndex) > index) {
            updated[`${blockSide}-${parseInt(blockIndex) - 1}`] = v;
          } else if (blockSide === side && parseInt(blockIndex) < index) {
            updated[k] = v;
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

  const handleControlPanelChange = useCallback((side: 'left' | 'right', newCount: number) => {
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

  const renderLines = () => {
    if (lineMode !== 'show' || !leftStackRef.current || !rightStackRef.current) return null;

    // Get container positions
    const leftContainerRect = leftStackRef.current.getBoundingClientRect();
    const rightContainerRect = rightStackRef.current.getBoundingClientRect();
    
    // Block dimensions
    const blockWidth = 48; // w-12 = 48px
    const blockHeight = 48;
    const blockGap = 4; // gap between blocks
    
    // Calculate exact positions for connecting points
    const leftX = leftContainerRect.right;
    const rightX = rightContainerRect.left;
    
    // Calculate Y positions for top blocks (reversed because flex-col-reverse)
    const leftTopY = leftContainerRect.bottom - blockHeight/2 - (leftCount - 1) * (blockHeight + blockGap);
    const rightTopY = rightContainerRect.bottom - blockHeight/2 - (rightCount - 1) * (blockHeight + blockGap);
    
    // Calculate Y positions for bottom blocks
    const leftBottomY = leftContainerRect.bottom - blockHeight/2;
    const rightBottomY = rightContainerRect.bottom - blockHeight/2;

    // Convert to relative coordinates
    const svgRect = document.querySelector('.block-container-svg')?.getBoundingClientRect() || document.body.getBoundingClientRect();
    const relativeLeftX = leftX - svgRect.left;
    const relativeRightX = rightX - svgRect.left;
    const relativeLeftTopY = leftTopY - svgRect.top;
    const relativeRightTopY = rightTopY - svgRect.top;
    const relativeLeftBottomY = leftBottomY - svgRect.top;
    const relativeRightBottomY = rightBottomY - svgRect.top;

    return (
      <svg
        className="absolute inset-0 pointer-events-none block-container-svg"
        style={{ 
          width: '100%', 
          height: '100%',
          zIndex: 10 
        }}
      >
        {/* Top line */}
        <line
          x1={relativeLeftX}
          y1={relativeLeftTopY}
          x2={relativeRightX}
          y2={relativeRightTopY}
          stroke="rgb(14 165 233)"
          strokeWidth="2"
          className="transition-all duration-300 ease-in-out"
        />
        {/* Connection dots for top line */}
        <circle
          cx={relativeLeftX}
          cy={relativeLeftTopY}
          r="4"
          fill="rgb(14 165 233)"
          className="transition-all duration-300 ease-in-out"
        />
        <circle
          cx={relativeRightX}
          cy={relativeRightTopY}
          r="4"
          fill="rgb(14 165 233)"
          className="transition-all duration-300 ease-in-out"
        />
        {/* Connection dots for bottom line */}
        <circle
          cx={relativeLeftX}
          cy={relativeLeftBottomY}
          r="4"
          fill="rgb(14 165 233)"
          className="transition-all duration-300 ease-in-out"
        />
        <circle
          cx={relativeRightX}
          cy={relativeRightBottomY}
          r="4"
          fill="rgb(14 165 233)"
          className="transition-all duration-300 ease-in-out"
        />
        {/* Bottom line */}
        <line
          x1={relativeLeftX}
          y1={relativeLeftBottomY}
          x2={relativeRightX}
          y2={relativeRightBottomY}
          stroke="rgb(14 165 233)"
          strokeWidth="2"
        />
      </svg>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-screen overflow-hidden">
      {/* Main content */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-lg font-family: 'Suez One', serif; text-sky-600 font-medium z-10">
        (instead have pop up at beggining with instructions and arrows and animations and stuff)
      </div>
      <div className="flex items-center flex-1">        {/* Left Control Panel */}
        <div className="flex-none">
          <ControlPanel 
            onNumberChange={(number) => handleControlPanelChange('left', number)} 
            currentBlocks={leftCount}
            maxBlocks={10}
          />
        </div>

        {/* Left Container */}
        <div className="flex-1 rounded-xl p-2 h-[700px] relative -mt-6
                      backdrop-blur-sm
                      flex flex-col items-center">
          <Dispenser 
            isDispensing={isLeftDispensing}
            onAnimationComplete={() => setIsLeftDispensing(false)}
            side="left"
          />
          <button 
            onClick={() => addBlock('left')}
    className="absolute top-16 right-8 px-4 py-1 bg-blue-500 text-white rounded-lg
               hover:bg-blue-600 transition-colors"
          >
            Add a Block!
          </button>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%]">
            <div ref={leftStackRef} className="flex flex-col-reverse relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 
                          text-3xl font-semibold text-sky-600 whitespace-nowrap">
                {leftCount}
              </div>
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
        <div className="flex-1 rounded-xl p-2 h-[700px] relative -mt-6
                      backdrop-blur-sm
                      flex flex-col items-center">
          <Dispenser 
            isDispensing={isRightDispensing}
            onAnimationComplete={() => setIsRightDispensing(false)}
            side="right"
          />
          <button 
            onClick={() => addBlock('right')}
            className="absolute top-16 left-8 px-4 py-1 bg-blue-500 text-white rounded-lg
            hover:bg-blue-600 transition-colors"
          >
            Add a Block!
          </button>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%]">
            <div ref={rightStackRef} className="flex flex-col-reverse relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 
                          text-3xl font-semibold text-sky-600 whitespace-nowrap">
                {rightCount}
              </div>
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

        {/* Right Control Panel */}
        <div className="flex-none">
          <ControlPanel 
            onNumberChange={(number) => handleControlPanelChange('right', number)} 
            currentBlocks={rightCount}
            maxBlocks={10}
          />
        </div>

        {renderLines()}
      </div>

      {/* Line Toggle at bottom */}
      <div className="flex justify-center">
        <LineToggle mode={lineMode} onModeChange={setLineMode} />
      </div>
    </div>
  );
};

export default BlockContainer;