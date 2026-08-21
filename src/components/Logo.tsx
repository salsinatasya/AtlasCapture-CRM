import React from 'react';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const Logo: React.FC<LogoProps> = ({ className, ...props }) => {
  return (
    <img 
      src="/logo.png" 
      alt="CRM Tangerang Logo" 
      className={`rounded-2xl object-contain ${className || ''}`}
      {...props} 
    />
  );
};

export default Logo;
