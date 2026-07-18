import { Router } from 'express';
import { validate } from '../../../core/middlewares/validation.middleware';
import { authenticate } from '../../../core/middlewares/auth.middleware';
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

const router = Router();

router.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(getRegisterController().register)
);

router.post('/refresh', asyncHandler(getRefreshController().refresh));

router.post('/logout', asyncHandler(getLogoutController().logout));

router.get(
  '/me',
  asyncHandler(authenticate),
  asyncHandler(getMeController().getMe)
);

router.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler(getLoginController().login)
);

export default router;
