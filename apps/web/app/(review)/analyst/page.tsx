'use client';

import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface Citation {
  documentId: string;
  fileName: string;
  chunkContent: string;
  pageNumber: number | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export default function AnalystPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const result = await apiFetch<{
        answer: string;
        citations: Citation[];
        confidence: 'HIGH' | 'MEDIUM' | 'LOW';
      }>('/analyst/query', {
        method: 'POST',
        body: JSON.stringify({ question }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.answer,
          citations: result.citations,
          confidence: result.confidence,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'What is the total NAV across all holdings?',
    'Which fund has the highest IRR?',
    'Summarize the latest capital call notices.',
    'What are the key metrics from the most recent fund reports?',
  ];

  return (
    <div className="h-full flex flex-col">
      <header className="border-b border-border px-6 py-4 shrink-0">
        <h1 className="text-sm font-semibold text-foreground">AI Analyst</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Ask questions about your portfolio data from approved documents</p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4 opacity-30">AI</div>
            <p className="text-sm text-muted-foreground mb-6">
              Ask a question about your portfolio, fund performance, or document contents.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-lg">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left px-3 py-2 text-xs rounded-md border border-border bg-card hover:bg-muted/50 text-muted-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
              m.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>

              {m.confidence && (
                <div className="mt-2">
                  <ConfidenceBadge level={m.confidence} />
                </div>
              )}

              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 border-t border-border/50 pt-2">
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">Sources:</p>
                  {m.citations.map((c, j) => (
                    <div key={j} className="text-[10px] text-muted-foreground mb-1">
                      <span className="font-medium">{c.fileName}</span>
                      {c.pageNumber && <span> (p.{c.pageNumber})</span>}
                      {c.chunkContent && (
                        <span className="block text-[9px] mt-0.5 opacity-70 line-clamp-2">&ldquo;{c.chunkContent}&rdquo;</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your portfolio..."
            className="flex-1 px-4 py-2.5 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function ConfidenceBadge({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const styles = {
    HIGH: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    LOW: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[level]}`}>
      Confidence: {level}
    </span>
  );
}
