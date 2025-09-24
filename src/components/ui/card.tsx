import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  rounded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  rounded = true,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  const borderStyle = border ? 'border border-gray-200' : '';
  const roundedStyle = rounded ? 'rounded-lg' : '';

  return (
    <div className={`bg-white ${paddingStyles[padding]} ${shadowStyles[shadow]} ${borderStyle} ${roundedStyle} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
