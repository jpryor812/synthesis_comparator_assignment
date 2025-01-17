import { useCallback, useRef } from 'react';

export const useLongPress = (onLongPress: () => void, duration = 500) => {
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