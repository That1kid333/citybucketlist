import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
