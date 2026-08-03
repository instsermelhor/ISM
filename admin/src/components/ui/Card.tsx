import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <div
      className={`bg-[#060c1d] border border-[#1e293b] rounded-xl p-5 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h3 className={`text-lg font-bold text-slate-100 ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={className}>{children}</div>;
}

export default Card;
