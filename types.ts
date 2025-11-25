export enum AppMode {
  Adult = 'ADULT',
  Kid = 'KID'
}

export enum ImageSize {
  Size_1K = '1K',
  Size_2K = '2K',
  Size_4K = '4K'
}

export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr'
}

export interface MeditationSession {
  id: string;
  title: string;
  script: string;
  mood: string;
  duration: string; // e.g., "Short", "Medium"
  visualStyle: string;
  visualPrompt: string;
  imageUrl?: string;
  audioBuffer?: AudioBuffer;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface UserPreferences {
  name: string;
  ageGroup: string; // "Adult", "3-5", "6-9", etc.
}