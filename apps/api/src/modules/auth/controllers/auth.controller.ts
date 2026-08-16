import { Request, Response } from 'express';
import { RegisterService } from '../services/register.service';
import { PasswordService } from '../../../core/security/password.service';
import { AuthRepository } from '../repositories/auth.repository';
import { RoleRepository } from '../../roles/repositories/role.repository';
import { AuditRepository } from '../../audit/repositories/audit.repository';
import { ApiResponse } from '../../../core/response/api-response';

export class AuthController {
  private readonly registerService: RegisterService;

  constructor() {
    this.registerService = new RegisterService(
      new PasswordService(),
      new AuthRepository(),
      new RoleRepository(),
      new AuditRepository()
    );
  }

  register = async (req: Request, res: Response) => {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const user = await this.registerService.execute(req.body, ipAddress, userAgent);

    return ApiResponse.created(res, user, 'User registered successfully');
  };
}
