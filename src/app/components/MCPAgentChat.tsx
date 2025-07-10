'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MCPAgentChat({ companyId }: { companyId: string }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const askAgent = async () => {
    const res = await fetch(`/api/mcp/${companyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: query }),
    });
    const data = await res.json();
    setResponse(data.result);
  };

  return (
    <div className="space-y-2">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask your portfolio agent..." />
      <Button onClick={askAgent}>Ask</Button>
      {response && <p className="text-muted-foreground mt-2">{response}</p>}
    </div>
  );
}
