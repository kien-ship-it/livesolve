import React from 'react';

export type ButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  [x: string]: any;
};

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variantStyles: Record<string, string> = {
  primary:
    'bg-black text-white hover:bg-neutral-800 focus:ring-black',
  secondary:
    'bg-white text-black border border-neutral-200 hover:bg-neutral-100 focus:ring-neutral-300',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={[
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button; 