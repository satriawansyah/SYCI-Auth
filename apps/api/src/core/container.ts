import { PasswordService } from './security/password.service';
import { JwtService } from './security/jwt.service';
import { CookieService } from './security/cookie.service';
import { AuthRepository } from '../modules/auth/repositories/auth.repository';
import { RoleRepository } from '../modules/roles/repositories/role.repository';
import { AuditRepository } from '../modules/audit/repositories/audit.repository';
import { RegisterService } from '../modules/auth/services/register.service';
import { RegisterController } from '../modules/auth/controllers/register.controller';
import { LoginController } from '../modules/auth/controllers/login.controller';
import { LoginService } from '../modules/auth/services/login.service';
import { RefreshService } from '../modules/auth/services/refresh.service';
import { LogoutService } from '../modules/auth/services/logout.service';
import { RefreshController } from '../modules/auth/controllers/refresh.controller';
import { LogoutController } from '../modules/auth/controllers/logout.controller';
import { MeController } from '../modules/auth/controllers/me.controller';
import { RoleManagementService } from '../modules/roles/services/role-management.service';
import { RoleManagementController } from '../modules/roles/controllers/role-management.controller';
import { Env } from '../config/env';

// Singleton instances
let passwordService: PasswordService;
let jwtService: JwtService;
let cookieService: CookieService;
let authRepository: AuthRepository;
let roleRepository: RoleRepository;
let auditRepository: AuditRepository;
let registerService: RegisterService;
let registerController: RegisterController;
let loginService: LoginService;
let loginController: LoginController;
let refreshService: RefreshService;
let logoutService: LogoutService;
let refreshController: RefreshController;
let logoutController: LogoutController;
let meController: MeController;
let roleManagementService: RoleManagementService;
let roleManagementController: RoleManagementController;

export function getPasswordService(): PasswordService {
  if (!passwordService) {
    passwordService = new PasswordService();
  }
  return passwordService;
}

export function getJwtService(): JwtService {
  if (!jwtService) {
    jwtService = new JwtService({
      secret: Env.JWT_SECRET,
      accessTokenTtl: Env.JWT_ACCESS_EXPIRY,
      refreshTokenTtl: Env.JWT_REFRESH_EXPIRY,
    });
  }
  return jwtService;
}

export function getCookieService(): CookieService {
  if (!cookieService) {
    cookieService = new CookieService({
      name: Env.REFRESH_TOKEN_COOKIE_NAME,
      httpOnly: true,
      secure: Env.REFRESH_TOKEN_COOKIE_SECURE,
      sameSite: Env.REFRESH_TOKEN_COOKIE_SAME_SITE,
      path: Env.REFRESH_TOKEN_COOKIE_PATH,
      domain: Env.REFRESH_TOKEN_COOKIE_DOMAIN,
      maxAge: Env.JWT_REFRESH_EXPIRY * 1000, // Convert seconds to milliseconds
    });
  }
  return cookieService;
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

export function getLoginService(): LoginService {
  if (!loginService) {
    loginService = new LoginService(
      getPasswordService(),
      getJwtService(),
      getAuthRepository(),
      getAuditRepository()
    );
  }
  return loginService;
}

export function getLoginController(): LoginController {
  if (!loginController) {
    loginController = new LoginController(getLoginService(), getCookieService());
  }
  return loginController;
}

export function getRefreshService(): RefreshService {
  if (!refreshService) {
    refreshService = new RefreshService(
      getPasswordService(),
      getJwtService(),
      getAuthRepository()
    );
  }
  return refreshService;
}

export function getLogoutService(): LogoutService {
  if (!logoutService) {
    logoutService = new LogoutService(getJwtService(), getAuthRepository());
  }
  return logoutService;
}

export function getRefreshController(): RefreshController {
  if (!refreshController) {
    refreshController = new RefreshController(getRefreshService(), getCookieService());
  }
  return refreshController;
}

export function getLogoutController(): LogoutController {
  if (!logoutController) {
    logoutController = new LogoutController(getLogoutService(), getCookieService());
  }
  return logoutController;
}

export function getMeController(): MeController {
  if (!meController) {
    meController = new MeController(getAuthRepository());
  }
  return meController;
}

export function getRoleManagementService(): RoleManagementService {
  if (!roleManagementService) {
    roleManagementService = new RoleManagementService(
      getAuthRepository(),
      getRoleRepository(),
      getAuditRepository()
    );
  }
  return roleManagementService;
}

export function getRoleManagementController(): RoleManagementController {
  if (!roleManagementController) {
    roleManagementController = new RoleManagementController(
      getRoleManagementService()
    );
  }
  return roleManagementController;
}
