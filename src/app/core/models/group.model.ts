import { Category } from './category.model';

export interface Group {
  _id: string;
  name: string;
  season: string | { _id: string; name?: string };
  ageCategory?: string | Category;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupCreateDto {
  name: string;
  season: string;
  ageCategory?: string;
  sortOrder?: number;
}

/** Value returned from group create/edit dialog */
export type GroupFormResult = GroupCreateDto & { _id?: string };
