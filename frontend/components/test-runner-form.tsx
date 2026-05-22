'use client';

import { useState } from 'react';
import { HTTPMethod } from '@/lib/types';
import { MethodBadge } from './method-badge';

interface TestRunnerFormProps {
  onGenerate: (url: string, method: HTTPMethod, description: string) => void;
  isLoading?: boolean;
}

const methods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];

export function TestRunnerForm({ onGenerate, isLoading = false }: TestRunnerFormProps) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HTTPMethod>('GET');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }
    onGenerate(url, method, description);
  };

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-md border border-border rounded-lg p-6 space-y-6" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
      {/* URL Input */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">API URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          placeholder="https://api.example.com/endpoint"
          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>

      {/* HTTP Method Selector */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">HTTP Method</label>
        <div className="flex gap-2 flex-wrap">
          {methods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              disabled={isLoading}
              className={`transition-all ${
                method === m
                  ? 'ring-2 ring-accent ring-offset-2 ring-offset-background'
                  : 'hover:opacity-80'
              } disabled:opacity-50`}
            >
              <MethodBadge method={m} size="md" />
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Description <span className="text-muted-foreground">(Optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          placeholder="Describe what this API test is for..."
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none transition-all disabled:opacity-50"
        />
      </div>

      {/* Generate Tests Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50 hover:shadow-2xl disabled:shadow-none"
      >
        {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
        {isLoading ? 'Generating...' : 'Generate Tests'}
      </button>
    </form>
  );
}
