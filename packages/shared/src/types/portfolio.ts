export interface PortfolioOverview {
  totalNav: string;
  totalCommitment: string;
  totalCalled: string;
  totalDistributed: string;
  holdingsCount: number;
  nextCall: {
    fundName: string;
    amount: string;
    dueDate: string;
  } | null;
}

export type EventType = 'CALL' | 'DISTRIBUTION';

export interface CapitalEventSummary {
  id: string;
  type: EventType;
  amount: string;
  eventDate: string;
  dueDate?: string;
  fundName: string;
  entityName: string;
  documentId?: string;
}

export interface FundSummary {
  id: string;
  name: string;
  manager: string;
  strategy: string;
  vintage: number;
  currency: string;
  totalCommitment: string;
  totalCalled: string;
  currentNav: string;
  irr?: string;
  tvpi?: string;
  dpi?: string;
}

export interface HoldingSummary {
  id: string;
  fundName: string;
  entityName: string;
  commitment: string;
  calledAmount: string;
  distributedAmount: string;
  currentNav: string;
}
