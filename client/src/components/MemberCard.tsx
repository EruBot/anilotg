import React from 'react';
import { Avatar } from './Avatar';

interface MemberCardProps {
  name: string;
  isAdmin?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({ name, isAdmin = false }) => {
  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
      <div className="relative">
        <Avatar name={name} size="md" />
        {isAdmin && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
            ★
          </div>
        )}
      </div>
      <p className="text-center text-sm font-medium text-slate-700 line-clamp-2 group-hover:text-purple-600 transition-colors">
        {name}
      </p>
      {isAdmin && (
        <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold">
          Admin
        </span>
      )}
    </div>
  );
};
