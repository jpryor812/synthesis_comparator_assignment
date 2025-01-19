'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

    const hasMounted = useRef(false);
    const [isPositioned, setIsPositioned] = useState(false);  
    const [clickedCircles, setClickedCircles] = useState<Set<CirclePosition>>(new Set());
    const [selectedCircle, setSelectedCircle] = useState<CirclePosition | null>(null);
    const [drawnLines, setDrawnLines] = useState<DrawnLine[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);
    const [dragStart, setDragStart] = useState<{x: number, y: number, position: CirclePosition} | null>(null);

  const resetLines = useCallback(() => {
    setDrawnLines([]);
    setClickedCircles(new Set());
    setSelectedCircle(null);
    setMousePos(null);
    setIsDragging(false);
    setDragStart(null);
  }, []);

  useEffect(() => {
    hasMounted.current = true;
    return () => {
      hasMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hasMounted.current) return;
    if (!leftStackRef.current || !rightStackRef.current) return;
  
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          setIsPositioned(true);
        });
      });
  
      resizeObserver.observe(leftStackRef.current);
      resizeObserver.observe(rightStackRef.current);
  
      return () => resizeObserver.disconnect();
    }, [leftStackRef, rightStackRef]);
  

  useEffect(() => {
    if (!hasMounted.current) return;
    const handleMouseMove = (e: MouseEvent) => {
      const svgRect = document.querySelector('.block-container-svg')?.getBoundingClientRect();
      if (svgRect && (isDragging || selectedCircle)) {
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

    useEffect(() => {
        if (!hasMounted.current) return;
        if (leftStackRef.current && rightStackRef.current) {
          setClickedCircles(new Set());
        }
      }, [leftStackRef, rightStackRef]); 
    
      useEffect(() => {
        if (!hasMounted.current) return;
        setDrawnLines([]);
        setClickedCircles(new Set());
      }, [leftCount, rightCount]);
    
      if (typeof window === 'undefined' || !hasMounted.current || !isPositioned) {
        return null;
      }

  const leftContainerRect = leftStackRef.current?.getBoundingClientRect() || new DOMRect();
  const rightContainerRect = rightStackRef.current?.getBoundingClientRect() || new DOMRect();
  
  const blockHeight = 48;
  const blockGap = 4;
  
  const leftX = leftContainerRect.right;
  const rightX = rightContainerRect.left;
  
  const leftTopY = leftContainerRect.bottom - blockHeight/2 - (leftCount - 1) * (blockHeight + blockGap);
  const rightTopY = rightContainerRect.bottom - blockHeight/2 - (rightCount - 1) * (blockHeight + blockGap);
  
  const leftBottomY = leftContainerRect.bottom - blockHeight/2;
  const rightBottomY = rightContainerRect.bottom - blockHeight/2;

  const svgRect = document.querySelector('.block-container-svg')?.getBoundingClientRect() || document.body.getBoundingClientRect();
  const relativeLeftX = leftX - svgRect.left;
  const relativeRightX = rightX - svgRect.left;
  const relativeLeftTopY = leftTopY - svgRect.top;
  const relativeRightTopY = rightTopY - svgRect.top;
  const relativeLeftBottomY = leftBottomY - svgRect.top;
  const relativeRightBottomY = rightBottomY - svgRect.top;

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
    setDragStart({
      x: x,
      y: y,
      position: position
    });
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
      case 'leftTop': return [relativeLeftX, relativeLeftTopY];
      case 'rightTop': return [relativeRightX, relativeRightTopY];
      case 'leftBottom': return [relativeLeftX, relativeLeftBottomY];
      case 'rightBottom': return [relativeRightX, relativeRightBottomY];
    }
  };

  // Function to render a circle with consistent styling
  const renderCircle = (cx: number, cy: number, position: CirclePosition) => {
    const isSelected = selectedCircle === position;
    const isClicked = clickedCircles.has(position);

    return (
      <g key={position}>
        {/* Outer circle */}
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
        {/* Inner dot */}
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
      {/* Lines only shown in 'show' mode */}
      {lineMode === 'show' && (
        <>
          <line
            x1={relativeLeftX}
            y1={relativeLeftTopY}
            x2={relativeRightX}
            y2={relativeRightTopY}
            stroke="rgb(14 165 233)"
            strokeWidth="2"
            className="transition-all duration-300 ease-in-out"
          />
          <line
            x1={relativeLeftX}
            y1={relativeLeftBottomY}
            x2={relativeRightX}
            y2={relativeRightBottomY}
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

      {/* Circles */}
      {renderCircle(relativeLeftX, relativeLeftTopY, 'leftTop')}
      {renderCircle(relativeRightX, relativeRightTopY, 'rightTop')}
      {renderCircle(relativeLeftX, relativeLeftBottomY, 'leftBottom')}
      {renderCircle(relativeRightX, relativeRightBottomY, 'rightBottom')}
    </svg>
  );
};