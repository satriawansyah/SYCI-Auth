import type { Request, Response } from 'express';
import { ApiResponse } from '../../../core/response/api-response';
import { CookieService } from '../../../core/security/cookie.service';
import { LogoutService } from '../services/logout.service';

export class LogoutController {
  constructor(
    private readonly logoutService: LogoutService,
    private readonly cookieService: CookieService
  ) {}

  logout = async (req: Request, res: Response) => {
    const refreshToken = this.cookieService.getRefreshTokenCookie(req) ?? undefined;
    await this.logoutService.execute(refreshToken);
    this.cookieService.clearRefreshTokenCookie(res);

    return ApiResponse.success(res, undefined, 'Logout successful');
  };
}
