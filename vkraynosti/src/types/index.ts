export interface Tour {
  id: string;
  season: 'winter' | 'spring' | 'summer' | 'fall';
  title: string;
  subtitle: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  price: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  galleryImages: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  experience: string;
  imageUrl: string;
}

export interface SafetyItem {
  id: string;
  icon: string;
  title: string;
  summary: string;
  details: string;
}

export type Season = 'winter' | 'spring' | 'summer' | 'fall';

export type ModalType = 'teamMember' | 'tourConsult' | null;

export interface ModalState {
  type: ModalType;
  payload?: TeamMember | null;
}
