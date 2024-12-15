import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200';
  const variantStyles = {
    primary: 'bg-[#C69249] hover:bg-[#B58239] text-white disabled:opacity-50',
    secondary: 'bg-neutral-800 hover:bg-neutral-700 text-white disabled:opacity-50',
    outline: 'border border-[#C69249] text-[#C69249] hover:bg-[#C69249] hover:text-white disabled:opacity-50'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
