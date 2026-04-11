import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: "eager" | "lazy";
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '', loading = "lazy" }) => {
  // Generate avatar URL using DiceBear API with anime style
  const encodedName = encodeURIComponent(name);
  const avatarUrl = `https://api.dicebear.com/7.x/lorelei/png?seed=${encodedName}&scale=80&backgroundColor=c0aede,d1d4f9,b6e3f5,ffd6e8,fcbad3`;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0 ${className}`}>
      <img
        src={avatarUrl}
        alt={name}
        className="w-full h-full object-cover"
        loading={loading}
        decoding="async"
      />
    </div>
  );
};
