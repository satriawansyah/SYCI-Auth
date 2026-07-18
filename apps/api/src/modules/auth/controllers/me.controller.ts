import type { Request, Response } from 'express';
import { AppError } from '../../../core/errors/app-error';
import { ApiResponse } from '../../../core/response/api-response';
import type { AuthenticatedRequest } from '../../../shared/types/authenticated-request.type';
import { UserMapper } from '../../user/mappers/user.mapper';
import { AuthRepository } from '../repositories/auth.repository';

export class MeController {
  constructor(private readonly authRepository: AuthRepository) {}

  getMe = async (req: Request, res: Response) => {
    const user = await this.authRepository.findUserById(
      (req as AuthenticatedRequest).auth.userId
    );
    if (!user || !user.isActive || user.deletedAt) {
      throw new AppError(401, 'User account is not active');
    }

    return ApiResponse.success(res, UserMapper.toResponse(user));
  };
}
