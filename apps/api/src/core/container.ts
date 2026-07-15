import { PasswordService } from './security/password.service';
import { AuthRepository } from '../modules/auth/repositories/auth.repository';
import { RoleRepository } from '../modules/roles/repositories/role.repository';
import { AuditRepository } from '../modules/audit/repositories/audit.repository';
import { RegisterService } from '../modules/auth/services/register.service';
import { RegisterController } from '../modules/auth/controllers/register.controller';

// Singleton instances
let passwordService: PasswordService;
let authRepository: AuthRepository;
let roleRepository: RoleRepository;
let auditRepository: AuditRepository;
let registerService: RegisterService;
let registerController: RegisterController;

export function getPasswordService(): PasswordService {
  if (!passwordService) {
    passwordService = new PasswordService();
  }
  return passwordService;
}

export function getAuthRepository(): AuthRepository {
  if (!authRepository) {
    authRepository = new AuthRepository();
  }
  return authRepository;
}

export function getRoleRepository(): RoleRepository {
  if (!roleRepository) {
    roleRepository = new RoleRepository();
  }
  return roleRepository;
}

export function getAuditRepository(): AuditRepository {
  if (!auditRepository) {
    auditRepository = new AuditRepository();
  }
  return auditRepository;
}

export function getRegisterService(): RegisterService {
  if (!registerService) {
    registerService = new RegisterService(
      getPasswordService(),
      getAuthRepository(),
      getRoleRepository(),
      getAuditRepository()
    );
  }
  return registerService;
}

export function getRegisterController(): RegisterController {
  if (!registerController) {
    registerController = new RegisterController(getRegisterService());
  }
  return registerController;
}
