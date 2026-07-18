import type { Request, Response } from 'express';
import { Env } from '../../../config/env';
import { AppError } from '../../../core/errors/app-error';
import { ApiResponse } from '../../../core/response/api-response';
import { RefreshService } from '../services/refresh.service';

export class RefreshController {
  constructor(private readonly refreshService: RefreshService) {}

  refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    if (!refreshToken) {
      throw new AppError(401, 'Refresh token is missing');
    }

    const result = await this.refreshService.execute(refreshToken);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: Env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Env.JWT_REFRESH_EXPIRY * 1000,
      path: '/api/v1/auth',
    });

    return ApiResponse.success(
      res,
      { accessToken: result.accessToken },
      'Token refreshed successfully'
    );
  };
}
