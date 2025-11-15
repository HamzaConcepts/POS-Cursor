import React from 'react';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
  return (
    <div className="bg-white border-b border-border-light p-6 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
};

export default Header;

