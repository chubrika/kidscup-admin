export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  birthDate: string;
  height?: number;
  photo?: string;
  teamId: string;
  teamName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerCreateDto {
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  birthDate: string;
  height?: number;
  photo?: string;
  teamId: string;
}
