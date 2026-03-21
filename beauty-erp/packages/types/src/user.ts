import { UserRole, AuthProvider } from './enums';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: UserRole;
  authProvider: AuthProvider;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string | null;
  role: UserRole;
  shopId?: string;
}
