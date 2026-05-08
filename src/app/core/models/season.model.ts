import { Category } from './category.model';

export interface SeasonPhoto {
  url: string;
  key: string;
  createdAt: string;
}

export interface SeasonAlbum {
  _id: string;
  title: string;
  photos: SeasonPhoto[];
  createdAt?: string;
}

export interface Season {
  _id: string;
  name: string;
  ageCategory: Category | string;
  albums?: SeasonAlbum[];
  photos?: SeasonPhoto[];
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
