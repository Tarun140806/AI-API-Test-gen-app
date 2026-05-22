import { HTTPMethod } from '@/lib/types';

interface MethodBadgeProps {
  method: HTTPMethod;
  size?: 'sm' | 'md' | 'lg';
}

const methodColors: Record<HTTPMethod, { bg: string; text: string }> = {
  GET: { bg: 'bg-green-500/20', text: 'text-green-400' },
  POST: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  PUT: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  DELETE: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export function MethodBadge({ method, size = 'md' }: MethodBadgeProps) {
  const { bg, text } = methodColors[method];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`method-badge ${bg} ${text} font-mono font-bold ${sizeClasses[size]}`}>
      {method}
    </span>
  );
}
