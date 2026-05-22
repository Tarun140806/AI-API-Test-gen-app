import { TestRun } from '@/lib/types';
import { CircularProgress } from './circular-progress';
import { TestResultCard } from './test-result-card';

interface ResultsPanelProps {
  testRun: TestRun;
  isRunning?: boolean;
}

export function ResultsPanel({ testRun, isRunning = false }: ResultsPanelProps) {
  const percentage = testRun.total > 0 ? (testRun.passed / testRun.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="backdrop-blur-md border border-border rounded-lg p-6" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Tests</div>
            <div className="text-3xl font-bold text-foreground">{testRun.total}</div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-sm text-green-400 mb-1">Passed</div>
              <div className="text-2xl font-bold text-green-400">{testRun.passed}</div>
            </div>
            <div>
              <div className="text-sm text-red-400 mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-400">{testRun.failed}</div>
            </div>
          </div>
        </div>

        {/* Circular Progress */}
        {testRun.results.length > 0 && (
          <div className="flex justify-center">
            <CircularProgress percentage={percentage} size={100} strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Test Results</h3>
        {testRun.results.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testRun.results.map((result) => (
              <TestResultCard key={result.testId} result={result} />
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-md border border-border rounded-lg p-8 text-center" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
            <div className="text-muted-foreground">
              {isRunning ? 'Running tests...' : 'No results yet. Run tests to see results here.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
