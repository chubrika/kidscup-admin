/** Basketball position codes stored in the database */
export type PlayerPositionCode = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: PlayerPositionCode | string;
  birthDate: string;
  height?: number;
  photo?: string;
  teamId: {
    _id: string;
    name: string;
    logo?: string;
    city?: string;
  } | string;
  teamName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerCreateDto {
  firstName: string;
  lastName: string;
  number: number;
  position: PlayerPositionCode | string;
  birthDate: string;
  height?: number;
  photo?: string;
  teamId: {
    _id: string;
    name: string;
    logo?: string;
    city?: string;
  } | string;
}
