import { Group } from './group.model';

export interface Round {
  _id: string;
  name: string;
  group: string | Group;
  roundNumber: number;
  date?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoundCreateDto {
  name: string;
  group: string;
  roundNumber: number;
  date?: string;
  sortOrder?: number;
}
