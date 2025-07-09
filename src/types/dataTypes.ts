export interface ProcessedData {
  id: string;
  name: string;
  content: any;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'processed' | 'failed';
  userId: string;
}

export interface DataMetadata {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'processed' | 'failed';
  userId: string;
}