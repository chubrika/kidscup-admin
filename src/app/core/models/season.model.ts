import { Category } from './category.model';

export interface Season {
  _id: string;
  name: string;
  ageCategory: Category | string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeasonCreateDto {
  name: string;
  ageCategory: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}
