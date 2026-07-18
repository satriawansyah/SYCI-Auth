import type { Request, Response } from 'express';
import { Env } from '../../../config/env';
import { ApiResponse } from '../../../core/response/api-response';
import { LogoutService } from '../services/logout.service';

export class LogoutController {
  constructor(private readonly logoutService: LogoutService) {}

  logout = async (req: Request, res: Response) => {
    await this.logoutService.execute(req.cookies.refreshToken as string | undefined);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: Env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
    });

    return ApiResponse.success(res, undefined, 'Logout successful');
  };
}
