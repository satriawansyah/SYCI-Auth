import type { User } from '@prisma/client';
import type { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username || undefined,
      fullName: user.fullName,
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      loginCount: user.loginCount,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toResponseDtoArray(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }
}
