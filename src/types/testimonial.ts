export interface Testimonial {
  id: string;
  clientName: string;
  content: string;
  rating?: number;
  image?: string;
  designation?: string;
  company?: string;
  country?: string;
  order: number;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}
