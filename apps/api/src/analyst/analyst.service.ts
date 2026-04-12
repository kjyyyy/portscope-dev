import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface Citation {
  documentId: string;
  fileName: string;
  chunkContent: string;
  pageNumber: number | null;
}

interface AnalystResponse {
  answer: string;
  citations: Citation[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Injectable()
export class AnalystService {
  private readonly logger = new Logger(AnalystService.name);

  constructor(private readonly prisma: PrismaService) {}

  async query(familyOfficeId: string, question: string): Promise<AnalystResponse> {
    const relevantDocs: any[] = await this.prisma.document.findMany({
      where: {
        familyOfficeId,
        status: { in: ['APPROVED', 'AUTO_APPROVED'] },
        extractedFields: { not: { equals: null } },
      },
      include: {
        fund: { select: { name: true } },
        entity: { select: { name: true } },
        chunks: { orderBy: { chunkIndex: 'asc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const context = this.buildContext(relevantDocs, question);
    const citations: Citation[] = [];

    for (const doc of relevantDocs) {
      if (doc.chunks.length > 0) {
        for (const chunk of doc.chunks) {
          if (this.isRelevant(chunk.content, question)) {
            citations.push({
              documentId: doc.id,
              fileName: doc.fileName,
              chunkContent: chunk.content.slice(0, 200),
              pageNumber: chunk.pageNumber,
            });
          }
        }
      }
    }

    const answer = await this.generateAnswer(context, question, familyOfficeId);

    return {
      answer,
      citations: citations.slice(0, 5),
      confidence: citations.length > 2 ? 'HIGH' : citations.length > 0 ? 'MEDIUM' : 'LOW',
    };
  }

  async getHistory(familyOfficeId: string) {
    return [];
  }

  private buildContext(docs: any[], question: string): string {
    const parts: string[] = [];

    for (const doc of docs) {
      const fields = doc.extractedFields as any;
      if (!fields) continue;

      let fieldSummary = '';
      if (Array.isArray(fields)) {
        fieldSummary = fields
          .map((f: any) => `${f.label || f.key}: ${f.value}`)
          .join('\n');
      } else if (typeof fields === 'object') {
        fieldSummary = Object.entries(fields)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n');
      }

      parts.push(
        `--- Document: ${doc.fileName} (${doc.type}) ---\n` +
          `Fund: ${doc.fund?.name ?? 'N/A'}\n` +
          `Entity: ${doc.entity?.name ?? 'N/A'}\n` +
          fieldSummary,
      );

      for (const chunk of doc.chunks) {
        parts.push(chunk.content);
      }
    }

    return parts.join('\n\n').slice(0, 12000);
  }

  private async generateAnswer(
    context: string,
    question: string,
    _familyOfficeId: string,
  ): Promise<string> {
    const llmProvider = process.env.LLM_PROVIDER ?? '';
    const llmBaseUrl = process.env.LLM_BASE_URL ?? '';
    const llmApiKey = process.env.LLM_API_KEY ?? '';
    const llmModel = process.env.LLM_MODEL ?? 'gpt-3.5-turbo';

    if (!llmBaseUrl || !llmApiKey) {
      return this.fallbackAnswer(context, question);
    }

    try {
      const messages = [
        {
          role: 'system',
          content:
            'You are a financial analyst assistant. Answer questions using ONLY the provided document context. ' +
            'If the context does not contain enough information, say "I don\'t have sufficient data to answer this question." ' +
            'Always cite the specific document name when referencing data. Format numbers clearly.',
        },
        {
          role: 'user',
          content: `Context from approved documents:\n\n${context}\n\nQuestion: ${question}`,
        },
      ];

      const response = await fetch(`${llmBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${llmApiKey}`,
        },
        body: JSON.stringify({ model: llmModel, messages, max_tokens: 1000, temperature: 0.1 }),
      });

      if (!response.ok) {
        this.logger.warn(`LLM API returned ${response.status}`);
        return this.fallbackAnswer(context, question);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content ?? this.fallbackAnswer(context, question);
    } catch (err: any) {
      this.logger.warn(`LLM query failed: ${err.message}`);
      return this.fallbackAnswer(context, question);
    }
  }

  private fallbackAnswer(context: string, question: string): string {
    const qLower = question.toLowerCase();
    const lines = context.split('\n').filter((l) => l.trim());
    const relevant = lines.filter((l) => {
      const lLower = l.toLowerCase();
      return qLower.split(' ').some((word) => word.length > 3 && lLower.includes(word));
    });

    if (relevant.length === 0) {
      return 'I don\'t have sufficient data in the approved documents to answer this question. Please ensure relevant documents have been uploaded and approved.';
    }

    return (
      'Based on the approved documents, here is what I found:\n\n' +
      relevant.slice(0, 10).join('\n') +
      '\n\nNote: This is a keyword-based search result. For more accurate AI-powered answers, configure the LLM provider in environment settings.'
    );
  }

  private isRelevant(content: string, question: string): boolean {
    const words = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const contentLower = content.toLowerCase();
    return words.some((w) => contentLower.includes(w));
  }
}
