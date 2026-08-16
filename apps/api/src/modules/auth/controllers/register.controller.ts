import { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { RegisterService } from '../services/register.service';
import { ApiResponse } from '../../../core/response/api-response';
import type { RegisterRequest } from '../validators/register.validator';

export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  register = async (
    req: Request<ParamsDictionary, any, RegisterRequest>,
    res: Response
  ) => {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const user = await this.registerService.execute(
      req.body,
      ipAddress,
      userAgent
    );

    return ApiResponse.created(res, user, 'User registered successfully');
  };
}
