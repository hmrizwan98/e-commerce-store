/** Root `contactSubmissions` collection, scoped by the `storeId` field (older docs have no
 * `read` field - treated as unread). */
export interface ContactSubmission {
  id: string;
  storeId?: string;
  name: string;
  email: string;
  message: string;
  read?: boolean;
  readAt?: number;
  createdAt?: number;
}
