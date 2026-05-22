import { useState } from 'react';
import { TestCase } from '@/lib/types';
import { MethodBadge } from './method-badge';
import { ChevronDown } from 'lucide-react';

interface TestCaseCardProps {
  testCase: TestCase;
  isRunning?: boolean;
}

export function TestCaseCard({ testCase, isRunning = false }: TestCaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine border color based on status code
  const getStatusBorderColor = (status: number) => {
    if (status >= 200 && status < 300) return '#10b981'; // Green for 2xx
    if (status >= 400 && status < 500) return '#f97316'; // Orange for 4xx
    if (status >= 500) return '#ef4444'; // Red for 5xx
    return '#7c3aed'; // Purple for others
  };

  const borderColor = getStatusBorderColor(testCase.expectedStatus);

  return (
    <div
      className="backdrop-blur-md border border-border rounded-lg overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: 'rgb(18 18 26 / 0.8)',
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isRunning}
        className="w-full p-4 flex items-center justify-between gap-3 hover:bg-card/50 disabled:opacity-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <ChevronDown
            size={18}
            className={`text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground mb-1">{testCase.name}</div>
            <div className="flex items-center gap-2">
              <MethodBadge method={testCase.method} size="sm" />
              <span className="text-xs text-muted-foreground font-mono">
                Status: {testCase.expectedStatus}
              </span>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border px-4 py-3 bg-background/50">
          {testCase.description && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-muted-foreground mb-1">Description</div>
              <p className="text-sm text-foreground/80">{testCase.description}</p>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">Expected Response</div>
            <div className="bg-background rounded p-2 font-mono text-sm text-accent">
              HTTP {testCase.expectedStatus}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
