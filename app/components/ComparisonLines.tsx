'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ComparisonLinesProps {
  leftStackRef: React.RefObject<HTMLDivElement | null>;
  rightStackRef: React.RefObject<HTMLDivElement | null>;
  leftCount: number;
  rightCount: number;
  lineMode: 'show' | 'draw';
}

type CirclePosition = 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
type DrawnLine = {
  start: CirclePosition;
  end: CirclePosition;
};

export const ComparisonLines: React.FC<ComparisonLinesProps> = ({
  leftStackRef,
  rightStackRef,
  leftCount,
  rightCount,
  lineMode
}) => {
  const [clickedCircles, setClickedCircles] = useState<Set<CirclePosition>>(new Set());
  const [selectedCircle, setSelectedCircle] = useState<CirclePosition | null>(null);
  const [drawnLines, setDrawnLines] = useState<DrawnLine[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);
  const [dragStart, setDragStart] = useState<{x: number, y: number, position: CirclePosition} | null>(null);
  const [coordinates, setCoordinates] = useState({
    leftX: 0,
    rightX: 0,
    leftTopY: 0,
    rightTopY: 0,
    leftBottomY: 0,
    rightBottomY: 0
  });

  // Define default rect object
  const defaultRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => {},
  };

  const resetLines = useCallback(() => {
    setDrawnLines([]);
    setClickedCircles(new Set());
    setSelectedCircle(null);
    setMousePos(null);
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Handle mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !selectedCircle) return;
      
      const svgElement = document.querySelector('.block-container-svg');
      if (svgElement) {
        const svgRect = svgElement.getBoundingClientRect();
        setMousePos({
          x: e.clientX - svgRect.left,
          y: e.clientY - svgRect.top
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
      }
    };

    if (isDragging || selectedCircle) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedCircle]);

  // Calculate and update coordinates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateCoordinates = () => {
      const leftContainerRect = leftStackRef.current?.getBoundingClientRect() || defaultRect;
      const rightContainerRect = rightStackRef.current?.getBoundingClientRect() || defaultRect;
      const svgRect = document.querySelector('.block-container-svg')?.getBoundingClientRect() || defaultRect;

      // Block dimensions
      const blockWidth = 48;
      const blockHeight = 48;
      const blockGap = 4;

      // Calculate positions
      const leftX = leftContainerRect.right - svgRect.left;
      const rightX = rightContainerRect.left - svgRect.left;
      const leftTopY = leftContainerRect.bottom - blockHeight/2 - (leftCount - 1) * (blockHeight + blockGap) - svgRect.top;
      const rightTopY = rightContainerRect.bottom - blockHeight/2 - (rightCount - 1) * (blockHeight + blockGap) - svgRect.top;
      const leftBottomY = leftContainerRect.bottom - blockHeight/2 - svgRect.top;
      const rightBottomY = rightContainerRect.bottom - blockHeight/2 - svgRect.top;

      setCoordinates({
        leftX,
        rightX,
        leftTopY,
        rightTopY,
        leftBottomY,
        rightBottomY
      });
    };

    // Initial calculation
    calculateCoordinates();

    // Recalculate on resize
    window.addEventListener('resize', calculateCoordinates);
    
    return () => window.removeEventListener('resize', calculateCoordinates);
  }, [leftCount, rightCount, leftStackRef, rightStackRef]);

  const isValidConnection = (start: CirclePosition, end: CirclePosition) => {
    return (
      (start.includes('Top') && end.includes('Top') && start !== end) ||
      (start.includes('Bottom') && end.includes('Bottom') && start !== end)
    );
  };

  const handleCircleMouseDown = (position: CirclePosition, x: number, y: number, e: React.MouseEvent) => {
    if (lineMode !== 'draw' || clickedCircles.has(position)) return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x, y, position });
  };

  const handleCircleClick = (position: CirclePosition, x: number, y: number, e: React.MouseEvent) => {
    if (lineMode !== 'draw' || clickedCircles.has(position)) return;
    
    e.stopPropagation();

    if (selectedCircle) {
      if (isValidConnection(selectedCircle, position)) {
        setDrawnLines(prev => [...prev, { start: selectedCircle, end: position }]);
        setClickedCircles(prev => {
          const newSet = new Set(prev);
          newSet.add(selectedCircle);
          newSet.add(position);
          return newSet;
        });
      }
      setSelectedCircle(null);
      setMousePos(null);
    } else if (!isDragging) {
      setSelectedCircle(position);
      setMousePos({ x, y });
    }
  };

  const handleCircleMouseUp = (endPosition: CirclePosition, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isDragging && dragStart && isValidConnection(dragStart.position, endPosition)) {
      setDrawnLines(prev => [...prev, { start: dragStart.position, end: endPosition }]);
      setClickedCircles(prev => {
        const newSet = new Set(prev);
        newSet.add(dragStart.position);
        newSet.add(endPosition);
        return newSet;
      });
    }
    
    setIsDragging(false);
    setDragStart(null);
  };

  // Function to get coordinates for a position
  const getCoordinates = (position: CirclePosition): [number, number] => {
    switch (position) {
      case 'leftTop': return [coordinates.leftX, coordinates.leftTopY];
      case 'rightTop': return [coordinates.rightX, coordinates.rightTopY];
      case 'leftBottom': return [coordinates.leftX, coordinates.leftBottomY];
      case 'rightBottom': return [coordinates.rightX, coordinates.rightBottomY];
    }
  };

  // Function to render a circle
  const renderCircle = (position: CirclePosition) => {
    const [cx, cy] = getCoordinates(position);
    const isSelected = selectedCircle === position;
    const isClicked = clickedCircles.has(position);

    return (
      <g key={position}>
        <circle
          cx={cx}
          cy={cy}
          r="8"
          stroke={isSelected ? "rgb(59 130 246)" : "rgb(14 165 233)"}
          strokeWidth={isSelected ? "3" : "2"}
          fill="white"
          className={`transition-all duration-300 ease-in-out ${
            lineMode === 'draw' && !isClicked ? 'cursor-pointer' : ''
          }`}
          onMouseDown={(e) => lineMode === 'draw' && !isClicked && handleCircleMouseDown(position, cx, cy, e)}
          onMouseUp={(e) => lineMode === 'draw' && !isClicked && handleCircleMouseUp(position, e)}
          onClick={(e) => lineMode === 'draw' && !isClicked && handleCircleClick(position, cx, cy, e)}
          pointerEvents={lineMode === 'draw' && !isClicked ? 'all' : 'none'}
        />
        <circle
          cx={cx}
          cy={cy}
          r="2"
          fill={isSelected ? "rgb(59 130 246)" : "rgb(14 165 233)"}
          className="transition-all duration-300 ease-in-out"
          pointerEvents="none"
        />
      </g>
    );
  };

  return (
    <svg
      className="absolute inset-0 block-container-svg pointer-events-none"
      style={{ 
        width: '100%', 
        height: '100%',
        zIndex: 10 
      }}
    >
      {/* Show mode lines */}
      {lineMode === 'show' && (
        <>
          <line
            x1={coordinates.leftX}
            y1={coordinates.leftTopY}
            x2={coordinates.rightX}
            y2={coordinates.rightTopY}
            stroke="rgb(14 165 233)"
            strokeWidth="2"
            className="transition-all duration-300 ease-in-out"
          />
          <line
            x1={coordinates.leftX}
            y1={coordinates.leftBottomY}
            x2={coordinates.rightX}
            y2={coordinates.rightBottomY}
            stroke="rgb(14 165 233)"
            strokeWidth="2"
            className="transition-all duration-300 ease-in-out"
          />
        </>
      )}

      {/* Draw mode completed lines */}
      {lineMode === 'draw' && drawnLines.map((line, index) => {
        const [x1, y1] = getCoordinates(line.start);
        const [x2, y2] = getCoordinates(line.end);
        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgb(14 165 233)"
            strokeWidth="2"
            className="transition-all duration-300 ease-in-out"
          />
        );
      })}

      {/* Temporary drag line */}
      {(isDragging || selectedCircle) && mousePos && (
        <line
          x1={isDragging ? dragStart!.x : getCoordinates(selectedCircle!)[0]}
          y1={isDragging ? dragStart!.y : getCoordinates(selectedCircle!)[1]}
          x2={mousePos.x}
          y2={mousePos.y}
          stroke="rgb(14 165 233)"
          strokeWidth="2"
          strokeDasharray="4"
          className="transition-all duration-300 ease-in-out"
        />
      )}

      {/* Render all circles */}
      {renderCircle('leftTop')}
      {renderCircle('rightTop')}
      {renderCircle('leftBottom')}
      {renderCircle('rightBottom')}
    </svg>
  );
};