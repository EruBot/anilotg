import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => {
  return (
    <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 shadow-sm hover:shadow-md">
      {icon && <div className="text-3xl">{icon}</div>}
      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-sm text-slate-600 text-center">{label}</p>
    </div>
  );
};
