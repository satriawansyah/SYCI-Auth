import type { Request, Response } from 'express';
import { ApiResponse } from '../../../core/response/api-response';
import { UserMapper } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';

export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  list = async (_req: Request, res: Response) => {
    const users = await this.userRepository.findActiveUsers();
    return ApiResponse.success(res, users.map(UserMapper.toResponse));
  };
}
