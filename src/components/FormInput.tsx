import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function FormInput({ label, className = '', ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-200">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-3 py-2 bg-white text-black border border-neutral-300 rounded-lg 
          focus:ring-2 focus:ring-[#C69249] focus:border-transparent 
          placeholder:text-gray-500 ${className}`}
      />
    </div>
  );
}