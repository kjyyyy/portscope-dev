import type { ClassifyResponse, ExtractionResponse } from '@portscope/shared';

export class ExtractorClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async classify(s3Key: string): Promise<ClassifyResponse> {
    const res = await fetch(`${this.baseUrl}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ s3_key: s3Key }),
    });

    if (!res.ok) {
      throw new Error(`Extractor classify failed: ${res.status} ${await res.text()}`);
    }

    return res.json();
  }

  async extract(
    s3Key: string,
    documentType: string,
  ): Promise<ExtractionResponse> {
    const res = await fetch(`${this.baseUrl}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ s3_key: s3Key, document_type: documentType }),
    });

    if (!res.ok) {
      throw new Error(`Extractor extract failed: ${res.status} ${await res.text()}`);
    }

    return res.json();
  }

  async health(): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/health`);
    return res.json();
  }
}

export default ExtractorClient;
