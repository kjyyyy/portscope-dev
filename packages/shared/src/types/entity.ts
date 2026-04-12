export type EntityType = 'TRUST' | 'LLC' | 'SPV' | 'INDIVIDUAL' | 'FOUNDATION';

export interface EntitySummary {
  id: string;
  name: string;
  type: EntityType;
  parentId?: string;
  children?: EntitySummary[];
  holdingsCount: number;
}

export interface FamilyOfficeSummary {
  id: string;
  name: string;
  entities: EntitySummary[];
  totalNav: string;
}
