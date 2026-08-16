import type { Request, Response } from 'express';
import { Env } from '../../../config/env';
import { ApiResponse } from '../../../core/response/api-response';
import { CookieService } from '../../../core/security/cookie.service';
import { LoginService } from '../services/login.service';
import type { LoginRequest } from '../validators/login.validator';

export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly cookieService: CookieService
  ) {}

  login = async (req: Request<unknown, unknown, LoginRequest>, res: Response) => {
    const { result, refreshToken } = await this.loginService.execute(
      req.body,
      req.ip,
      req.get('user-agent')
    );

    const expiresAt = new Date(Date.now() + Env.JWT_REFRESH_EXPIRY * 1000);
    this.cookieService.setRefreshTokenCookie(res, refreshToken, expiresAt);

    return ApiResponse.success(res, result, 'Login successful');
  };
}
