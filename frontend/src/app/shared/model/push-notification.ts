export interface PushNotification {
  _id?: string;
  message: string;
  userId: string;
  category?: string;
  isRead?: boolean;
  createdAt?: string;
}
