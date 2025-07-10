// app/api/mcp/[companyId]/route.ts
import { getCompanyAgent } from '@/lib/my-mastra-app/src/mastra/agents';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { prompt } = await req.json();
  const agent = getCompanyAgent(params.companyId);
  const result = await agent.run(prompt);
  return NextResponse.json({ result });
}
