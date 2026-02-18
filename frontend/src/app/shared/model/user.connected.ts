export interface UserConnected {
  id: string;
  username: string;
  email: string;
  role: string;
  iat: number; // timestamp de création
  exp: number; // timestamp d'expiration

}
