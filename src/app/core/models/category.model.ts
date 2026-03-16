export interface Category {
  _id: string;
  name: string;
  minAge?: number;
  maxAge?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgeCategoryCreateDto {
  name: string;
  minAge?: number;
  maxAge?: number;
  description?: string;
}
