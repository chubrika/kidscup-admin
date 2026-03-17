export interface Team {
  _id: string;
  name: string;
  logo?: string;
  logoKey?: string;
  city: string;
  coachName: string;
  /** Category ID (string) or populated category object from API */
  ageCategory: { _id: string; name?: string };
  /** Season ID (string) or populated season object from API */
  season?: { _id: string; name?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamCreateDto {
  name: string;
  logo?: string;
  logoKey?: string;
  city: string;
  coachName: string;
  /** Category ID (MongoDB ObjectId string) */
  ageCategory?: string;
  /** Season ID (MongoDB ObjectId string) */
  season?: string;
}
