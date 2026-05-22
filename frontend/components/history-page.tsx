'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MethodBadge } from './method-badge';
import { ChevronDown } from 'lucide-react';
import { fetchHistory } from '@/lib/mock-api';

export function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchHistory();
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading history...</div>
      </div>
    );
  }

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Test History</h1>
            <p className="text-muted-foreground">View past test runs and their results</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchHistory().then(setHistory).finally(() => setLoading(false)); }}
            className="text-sm text-purple-400 hover:text-purple-300 border border-purple-400/30 px-3 py-1 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {history.map((run) => {
            const isExpanded = expandedId === run.test_run_id;
            const passPercentage = run.total > 0 ? (run.passed / run.total) * 100 : 0;

            return (
              <div key={run.test_run_id} className="backdrop-blur-md border border-border rounded-lg overflow-hidden" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : run.test_run_id)}
                  className="w-full p-4 flex items-center justify-between gap-4 hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <ChevronDown
                      size={20}
                      className={`text-muted-foreground flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <MethodBadge method={run.method} size="sm" />
                        <code className="text-sm font-mono text-accent bg-background/50 px-2 py-1 rounded truncate">
                          {run.api_url}
                        </code>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">{formatDate(run.created_at)}</div>
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

                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 bg-background/50 space-y-3">
                    <div className="text-sm font-semibold text-muted-foreground mb-2">Test Cases</div>
                    {run.test_cases.map((tc: any) => (
                      <div key={tc.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{tc.name}</div>
                          <div className="text-xs text-muted-foreground">{tc.description}</div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="text-muted-foreground">Expected: {tc.expected_status}</span>
                          <span className="text-muted-foreground">Actual: {tc.actual_status ?? '—'}</span>
                          {tc.passed === true && <span className="text-green-400 font-bold">PASSED</span>}
                          {tc.passed === false && <span className="text-red-400 font-bold">FAILED</span>}
                          {tc.passed === null && <span className="text-yellow-400 font-bold">NOT RUN</span>}
                        </div>
                      </div>
                    ))}
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