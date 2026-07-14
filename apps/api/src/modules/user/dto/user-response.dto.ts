export interface UserResponseDto {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}
