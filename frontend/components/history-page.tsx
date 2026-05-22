'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TestRun } from '@/lib/types';
import { useTestRun } from '@/lib/test-run-context';
import { MethodBadge } from './method-badge';
import { StatusBadge } from './status-badge';
import { TestResultCard } from './test-result-card';
import { ChevronDown, Trash2 } from 'lucide-react';

export function HistoryPage() {
  const router = useRouter();
  const { history, deleteHistoryItem } = useTestRun();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="backdrop-blur-md border border-border rounded-lg p-12 text-center" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No Test History</h2>
            <p className="text-muted-foreground mb-6">
              Run some tests first to see your test execution history here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:from-purple-500 hover:to-purple-400 shadow-lg hover:shadow-purple-500/50 hover:shadow-2xl"
            >
              Go to Test Runner
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Test History</h1>
          <p className="text-muted-foreground">View past test runs and their results</p>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {history.map((run) => {
            const isExpanded = expandedId === run.id;
            const passPercentage = run.total > 0 ? (run.passed / run.total) * 100 : 0;

            return (
              <div key={run.id} className="backdrop-blur-md border border-border rounded-lg overflow-hidden" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
                {/* Summary Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : run.id)}
                  className="w-full p-4 flex items-center justify-between gap-4 hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <ChevronDown
                      size={20}
                      className={`text-muted-foreground flex-shrink-0 mt-1 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />

                    <div className="flex-1 min-w-0 text-left">
                      {/* URL and Method */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <MethodBadge method={run.method} size="sm" />
                        <code className="text-sm font-mono text-accent bg-background/50 px-2 py-1 rounded truncate">
                          {run.url}
                        </code>
                      </div>

                      {/* Timestamp */}
                      <div className="text-sm text-muted-foreground mb-3">{formatDate(run.timestamp)}</div>

                      {/* Pass Rate Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0 bg-background rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-full transition-all duration-300"
                            style={{ width: `${passPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-mono font-bold text-foreground whitespace-nowrap">
                          {run.passed}/{run.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">{run.passed}</div>
                      <div className="text-xs text-muted-foreground">passed</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-400">{run.failed}</div>
                      <div className="text-xs text-muted-foreground">failed</div>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 bg-background/50 space-y-4">
                    {/* Description */}
                    {run.description && (
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-2">Description</div>
                        <p className="text-sm text-foreground/80">{run.description}</p>
                      </div>
                    )}

                    {/* Test Results */}
                    {run.results.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-3">Test Results</div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {run.results.map((result) => (
                            <TestResultCard key={result.testId} result={result} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete Button */}
                    <div className="pt-4 border-t border-border">
                      <button
                        onClick={() => deleteHistoryItem(run.id)}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
