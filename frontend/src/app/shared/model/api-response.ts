
// Type générique pour la réponse du backend
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}
