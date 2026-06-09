import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

const YOUTUBE_URL_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
];

/** Extract an 11-character YouTube video ID from a URL or raw ID string. */
export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (YOUTUBE_ID_PATTERN.test(trimmed)) return trimmed;

  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function youtubeThumbnailUrl(videoId: string, quality: 'maxresdefault' | 'hqdefault' = 'maxresdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function youtubeUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';
    if (!value) return null;
    return extractYouTubeId(value) ? null : { invalidYoutube: true };
  };
}
