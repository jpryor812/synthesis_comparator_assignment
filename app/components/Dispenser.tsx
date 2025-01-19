import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DispenserProps {
    isDispensing: boolean;
    onAnimationComplete?: () => void;
    side: 'left' | 'right';
}

export const Dispenser: React.FC<DispenserProps> = ({ isDispensing, onAnimationComplete, side }) => {
    const [blocks, setBlocks] = useState([0, 1]);
    
    useEffect(() => {
        if (isDispensing) {
            setTimeout(() => {
                setBlocks(prev => [Math.max(...prev) + 1, prev[0]]);
            }, 200);
        }
    }, [isDispensing]);

    return (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-28">
            <div className="absolute inset-x-0 bottom-0 border-2 border-t-0 border-orange-400 rounded-b-lg overflow-hidden h-[90%]" />
            
            <div className="absolute inset-x-2">
                <AnimatePresence>
                    {blocks.map((id, index) => (
                        <motion.div
                            key={id}
                            initial={{ y: index * 56 }}
                            animate={{ y: index * 56 }}
                            exit={{ y: index * 48 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 400,
                            }}
                            className="absolute w-12 h-12 rounded bg-gradient-to-br from-sky-300 via-sky-400 to-sky-500 
                                     shadow-lg border border-sky-400"
                        />
                    ))}
                </AnimatePresence>
            </div>

            <motion.div 
                className="absolute bottom-0 left-0 right-0 h-2 bg-orange-400"
                animate={{ 
                    x: isDispensing ? (side === 'left' ? -96 : 96) : 0 
                }}
                transition={{ duration: 0.15 }}
                onAnimationComplete={onAnimationComplete}
            />
        </div>
    );
};