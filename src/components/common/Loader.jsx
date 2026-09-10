const SIZE_MAP = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export const Loader = ({ size = 'md', className = '', label = 'Loading...' }) => {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center justify-center ${className}`}
    >
      <span
        className={`
          animate-spin rounded-full border-current border-t-transparent
          ${SIZE_MAP[size]}
        `.trim().replace(/\s+/g, ' ')}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
};

// Full-page / section overlay variant
export const LoaderOverlay = ({ label = 'Loading...' }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10">
      <div className="flex flex-col items-center gap-2 text-indigo-600">
        <Loader size="lg" />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
    </div>
  );
};

export default Loader;