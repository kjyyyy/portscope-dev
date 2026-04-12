export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  fieldType: 'money' | 'date' | 'text' | 'routing_number' | 'ein' | 'percentage';
  highlight?: {
    page: number;
    bbox: [number, number, number, number];
  };
}

export type DocumentType =
  | 'CAPITAL_CALL'
  | 'DISTRIBUTION'
  | 'NAV_STATEMENT'
  | 'K1'
  | 'FUND_REPORT'
  | 'UNKNOWN';

export type DocumentStatus =
  | 'PROCESSING'
  | 'REVIEW'
  | 'AUTO_APPROVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ERROR';

export interface DocumentSummary {
  id: string;
  fileName: string;
  type: DocumentType;
  status: DocumentStatus;
  fundName?: string;
  entityName?: string;
  amount?: string;
  dueDate?: string;
  confidence?: number;
  flaggedFieldCount: number;
  createdAt: string;
}

export interface ClassifyResponse {
  documentType: DocumentType;
  confidence: number;
}

export interface ExtractionResponse {
  fields: ExtractedField[];
  documentType: DocumentType;
  overallConfidence: number;
}
