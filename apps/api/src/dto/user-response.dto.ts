export interface UserResponseDto {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  isActive: boolean;
  loginCount: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
