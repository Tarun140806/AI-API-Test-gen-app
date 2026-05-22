interface StatusBadgeProps {
  passed: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ passed, label, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  if (passed) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-mono font-bold bg-green-500/20 text-green-400 ${sizeClasses[size]}`}>
        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        {label || 'PASSED'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-mono font-bold bg-red-500/20 text-red-400 ${sizeClasses[size]}`}>
      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
      {label || 'FAILED'}
    </span>
  );
}
