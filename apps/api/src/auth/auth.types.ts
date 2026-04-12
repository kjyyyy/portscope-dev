import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    familyOfficeId: string;
    role: 'STAFF' | 'CLIENT';
    name?: string;
    familyOfficeName?: string;
  };
}
