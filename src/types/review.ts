export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt?: number;
  updatedAt?: number;
}
