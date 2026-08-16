import type { UserResponseDto } from '../../user/dto/user-response.dto';

export interface LoginResponseDto {
  user: UserResponseDto;
  accessToken: string;
}
