import React from 'react';

interface AddButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isFull?: boolean;
}

export const AddButton: React.FC<AddButtonProps> = ({ 
  onClick, 
  disabled, 
  className,
  isFull = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-2 py-2 text-sm font-bold text-white uppercase
        ${isFull ? 'bg-yellow-500 hover:bg-yellow-500' : 'bg-[#1899D6] hover:brightness-110'}
        rounded-2xl border-transparent
        transition-all duration-200
        before:content-[''] before:absolute before:inset-0 before:-z-10
        ${isFull ? 'before:bg-yellow-600' : 'before:bg-[#1CB0F6]'}
        before:rounded-2xl before:translate-y-[0px]
        active:before:translate-y-0 active:translate-y-[0px]
        disabled:cursor-auto disabled:opacity-80
        ${className}
      `}
    >
      {isFull ? 'Stack Full!' : 'Add a Block!'}
    </button>
  );
};