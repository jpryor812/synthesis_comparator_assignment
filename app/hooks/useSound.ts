import { useState, useCallback } from 'react';

export const useSound = () => {
    const [audio] = useState(() => {
        if (typeof window !== 'undefined') {
            const audioContext = new AudioContext();
            return audioContext;
        }
        return null;
    });

    const playStackSound = useCallback((index: number) => {
        if (!audio) return;
        
        const oscillator = audio.createOscillator();
        const gainNode = audio.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audio.destination);
        
        oscillator.frequency.value = 200 + (index * 50);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audio.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audio.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audio.currentTime + 0.2);
        
        oscillator.start(audio.currentTime);
        oscillator.stop(audio.currentTime + 0.2);
    }, [audio]);

    return { playStackSound };
};