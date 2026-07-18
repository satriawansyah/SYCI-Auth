import type { Request, Response } from 'express';
import { Env } from '../../../config/env';
import { ApiResponse } from '../../../core/response/api-response';
import { LoginService } from '../services/login.service';
import type { LoginRequest } from '../validators/login.validator';

export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  login = async (req: Request<unknown, unknown, LoginRequest>, res: Response) => {
    const { result, refreshToken } = await this.loginService.execute(
      req.body,
      req.ip,
      req.get('user-agent')
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: Env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Env.JWT_REFRESH_EXPIRY * 1000,
      path: '/api/v1/auth',
    });

    return ApiResponse.success(res, result, 'Login successful');
  };
}
