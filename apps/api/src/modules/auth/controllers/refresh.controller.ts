import type { Request, Response } from 'express';
import { Env } from '../../../config/env';
import { AppError } from '../../../core/errors/app-error';
import { ApiResponse } from '../../../core/response/api-response';
import { CookieService } from '../../../core/security/cookie.service';
import { RefreshService } from '../services/refresh.service';

export class RefreshController {
  constructor(
    private readonly refreshService: RefreshService,
    private readonly cookieService: CookieService
  ) {}

  refresh = async (req: Request, res: Response) => {
    const refreshToken = this.cookieService.getRefreshTokenCookie(req);
    if (!refreshToken) {
      throw new AppError(401, 'Refresh token is missing');
    }

    const result = await this.refreshService.execute(refreshToken);
    const expiresAt = new Date(Date.now() + Env.JWT_REFRESH_EXPIRY * 1000);
    this.cookieService.setRefreshTokenCookie(res, result.refreshToken, expiresAt);

    return ApiResponse.success(
      res,
      { accessToken: result.accessToken },
      'Token refreshed successfully'
    );
  };
}
