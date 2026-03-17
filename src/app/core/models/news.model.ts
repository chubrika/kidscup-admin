export interface News {
  _id: string;
  title: string;
  description: string;
  photoUrl: string;
  photoKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsCreateDto {
  title: string;
  description: string;
  photoUrl: string;
  photoKey?: string;
}
