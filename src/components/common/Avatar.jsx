import { useState } from 'react';

const SIZE_STYLES = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

const STATUS_COLORS = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromName = (name = '') => {
  const colors = [
    'bg-indigo-500', 'bg-pink-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-sky-500', 'bg-purple-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar = ({
  src,
  name = '',
  size = 'md',
  status,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <span className={`relative inline-flex flex-shrink-0 ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          onError={() => setImgError(true)}
          className={`rounded-full object-cover ${SIZE_STYLES[size]}`}
        />
      ) : (
        <span
          className={`
            flex items-center justify-center rounded-full font-semibold text-white
            ${SIZE_STYLES[size]} ${getColorFromName(name)}
          `.trim().replace(/\s+/g, ' ')}
        >
          {getInitials(name)}
        </span>
      )}

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2 ring-white
            ${STATUS_COLORS[status]}
            ${size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'}
          `.trim().replace(/\s+/g, ' ')}
        />
      )}
    </span>
  );
};

export default Avatar;
