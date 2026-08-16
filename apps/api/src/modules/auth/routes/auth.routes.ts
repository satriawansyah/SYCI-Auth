import { Router } from 'express';
import { validate } from '../../../core/middlewares/validation.middleware';
import { authenticate } from '../../../core/middlewares/auth.middleware';
import {
  authRateLimiter,
  refreshRateLimiter,
} from '../../../core/middlewares/rate-limit.middleware';
import { asyncHandler } from '../../../core/utils/async-handler';
import { registerSchema } from '../validators/register.validator';
import { loginSchema } from '../validators/login.validator';
import {
  getLoginController,
  getLogoutController,
  getMeController,
  getRefreshController,
  getRegisterController,
} from '../../../core/container';
import { isSafeRedirectTarget } from '../../../utils/redirect';
import { ApiResponse } from '../../../core/response/api-response';

const router = Router();

// Lets frontends (the central login page, or any subdomain app) check whether a
// `redirect` URL they received is one of your trusted apps before navigating to it.
// Prevents open-redirect abuse of the SSO login flow.
router.get('/redirect-check', (req, res) => {
  const url = typeof req.query.url === 'string' ? req.query.url : '';
  return ApiResponse.success(res, { safe: isSafeRedirectTarget(url) });
});

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(getRegisterController().register)
);

router.post(
  '/refresh',
  refreshRateLimiter,
  asyncHandler(getRefreshController().refresh)
);

router.post('/logout', asyncHandler(getLogoutController().logout));

router.get(
  '/me',
  asyncHandler(authenticate),
  asyncHandler(getMeController().getMe)
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(getLoginController().login)
);

export default router;
