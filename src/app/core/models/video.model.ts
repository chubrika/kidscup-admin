export type VideoCategory = 'Full Match' | 'Highlights' | 'Interview';

export type VideoStatus = 'draft' | 'published';

export interface Video {
  _id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: VideoCategory;
  status: VideoStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoCreateDto {
  title: string;
  description: string;
  youtubeId: string;
  category: VideoCategory;
  status: VideoStatus;
}

export const VIDEO_CATEGORIES: VideoCategory[] = ['Full Match', 'Highlights', 'Interview'];

export const VIDEO_STATUSES: { value: VideoStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];
