import { TestResult } from '@/lib/types';
import { StatusBadge } from './status-badge';

interface TestResultCardProps {
  result: TestResult;
}

export function TestResultCard({ result }: TestResultCardProps) {
  return (
    <div className="backdrop-blur-md border border-border rounded-lg p-4 transition-all duration-200" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground mb-2">{result.testName}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono bg-background/50 px-2 py-1 rounded text-muted-foreground">
              Expected: {result.expectedStatus}
            </span>
            <span className="text-xs font-mono bg-background/50 px-2 py-1 rounded text-muted-foreground">
              Actual: {result.actualStatus}
            </span>
            <span className="text-xs font-mono bg-background/50 px-2 py-1 rounded text-muted-foreground">
              {result.duration}ms
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge passed={result.passed} size="sm" />
        </div>
      </div>

      {result.error && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400 font-mono">
          {result.error}
        </div>
      )}
    </div>
  );
}
