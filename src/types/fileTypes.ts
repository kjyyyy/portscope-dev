export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  userId: string;
  status: 'pending' | 'processed' | 'failed';
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  userId: string;
  status: 'pending' | 'processed' | 'failed';
}