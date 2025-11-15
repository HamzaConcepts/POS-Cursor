import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  className = ''
}) => {
  return (
    <div className={`bg-white border border-border-light rounded p-6 ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        {icon && <div className="text-text-secondary">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-text-primary mb-1">{value}</div>
      {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
    </div>
  );
};

export default DashboardCard;


