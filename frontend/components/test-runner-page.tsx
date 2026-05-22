'use client';

import { useState } from 'react';
import { HTTPMethod, TestRun, TestCase } from '@/lib/types';
import { generateMockTestCases, executeTestCases } from '@/lib/mock-api';
import { useTestRun } from '@/lib/test-run-context';
import { TestRunnerForm } from '@/components/test-runner-form';
import { TestCaseCard } from '@/components/test-case-card';
import { ResultsPanel } from '@/components/results-panel';
import { MethodBadge } from '@/components/method-badge';

export function TestRunnerPage() {
  const { setCurrentRun, addToHistory } = useTestRun();
  const [currentTestRun, setCurrentTestRun] = useState<TestRun | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleGenerateTests = async (url: string, method: HTTPMethod, description: string) => {
    setIsGenerating(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const testCases = generateMockTestCases(url, method);

      const newRun: TestRun = {
        id: `run-${Date.now()}`,
        url,
        method,
        description,
        timestamp: new Date(),
        testCases,
        results: [],
        passed: 0,
        failed: 0,
        total: testCases.length,
      };

      setCurrentTestRun(newRun);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunAllTests = async () => {
    if (!currentTestRun) return;

    setIsRunning(true);
    try {
      const results = await executeTestCases(currentTestRun.testCases, currentTestRun.url);

      const passed = results.filter((r) => r.passed).length;
      const failed = results.filter((r) => !r.passed).length;

      const updatedRun: TestRun = {
        ...currentTestRun,
        results,
        passed,
        failed,
      };

      setCurrentTestRun(updatedRun);
      setCurrentRun(updatedRun);
      addToHistory(updatedRun);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full h-screen flex flex-col lg:flex-row">
        {/* Left Panel */}
        <div className="flex-1 overflow-y-auto border-b lg:border-b-0 lg:border-r border-border">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Test Runner</h1>
              <p className="text-muted-foreground">Generate and run API tests in seconds</p>
            </div>

            {/* Form */}
            <TestRunnerForm onGenerate={handleGenerateTests} isLoading={isGenerating} />

            {/* Test Cases */}
            {currentTestRun && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">Generated Test Cases</h2>
                  <div className="space-y-3">
                    {currentTestRun.testCases.map((testCase) => (
                      <TestCaseCard
                        key={testCase.id}
                        testCase={testCase}
                        isRunning={isRunning}
                      />
                    ))}
                  </div>
                </div>

                {/* Run All Tests Button */}
                <button
                  onClick={handleRunAllTests}
                  disabled={isRunning}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:from-green-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-green-500/50 hover:shadow-2xl disabled:shadow-none"
                >
                  {isRunning && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isRunning ? 'Running Tests...' : 'Run All Tests'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 overflow-y-auto hidden lg:block">
          <div className="p-6 space-y-6">
            {currentTestRun ? (
              <>
                {/* API Info */}
                <div className="backdrop-blur-md border border-border rounded-lg p-4" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">Testing</div>
                      <div className="font-mono text-sm text-accent break-all mb-3">{currentTestRun.url}</div>
                      <MethodBadge method={currentTestRun.method} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Results */}
                <ResultsPanel testRun={currentTestRun} isRunning={isRunning} />
              </>
            ) : (
              <div className="backdrop-blur-md border border-border rounded-lg p-8 text-center h-full flex items-center justify-center" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
                <div>
                  <div className="text-6xl mb-4">🧪</div>
                  <p className="text-muted-foreground">Generate tests to see results here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Results Panel */}
        {currentTestRun && (
          <div className="lg:hidden flex-1 overflow-y-auto border-t border-border">
            <div className="p-6">
              <ResultsPanel testRun={currentTestRun} isRunning={isRunning} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
