import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-150 active:translate-y-1 active:shadow-none uppercase tracking-wide';

  const variants = {
    primary:
      'bg-[#1CB0F6] text-white hover:bg-[#1899D6] border-b-4 border-[#1899D6]',
    success:
      'bg-[#58CC02] text-white hover:bg-[#46A302] border-b-4 border-[#46A302]',
    danger:
      'bg-[#FF4B4B] text-white hover:bg-[#EA2B2B] border-b-4 border-[#EA2B2B]',
    secondary:
      'bg-white text-gray-500 border-2 border-gray-200 border-b-4 hover:bg-gray-50',
    ghost:
      'bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-500 active:translate-y-0 active:shadow-none',
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg w-full',
  };

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed translate-y-1 shadow-none border-b-0'
    : '';

  return (
    <button
      className={twMerge(
        clsx(baseStyles, variants[variant], sizes[size], disabledStyles, className)
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
