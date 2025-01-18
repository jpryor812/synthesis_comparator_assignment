import React from 'react';

interface AddButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const AddButton: React.FC<AddButtonProps> = ({ onClick, disabled, className }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-2 py-2 text-sm font-bold text-white uppercase
        bg-[#1899D6] hover:brightness-110
        rounded-2xl border-transparent
        transition-all duration-200
        before:content-[''] before:absolute before:inset-0 before:-z-10
        before:bg-[#1CB0F6] before:rounded-2xl before:translate-y-[0px]
        active:before:translate-y-0 active:translate-y-[0px]
        disabled:cursor-auto disabled:opacity-70
        ${className}
      `}
    >
      Add a Block!
    </button>
  );
};