export interface Team {
  _id: string;
  name: string;
  logo?: string;
  city: string;
  coachName: string;
  /** Category ID (string) or populated category object from API */
  ageCategory: string | { _id: string; name?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamCreateDto {
  name: string;
  logo?: string;
  city: string;
  coachName: string;
  /** Category ID (MongoDB ObjectId string) */
  ageCategory?: string;
}
