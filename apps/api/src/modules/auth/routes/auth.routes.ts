import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../../../core/middlewares/validation.middleware';
import { asyncHandler } from '../../../core/utils/async-handler';
import { registerSchema } from '../validators/register.validator';

const router = Router();

const controller = new AuthController();

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(controller.register)
);

export default router;
