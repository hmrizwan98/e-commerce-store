export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}
