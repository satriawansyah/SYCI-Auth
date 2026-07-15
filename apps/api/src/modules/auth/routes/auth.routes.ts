import { Router } from 'express';
import { validate } from '../../../core/middlewares/validation.middleware';
import { asyncHandler } from '../../../core/utils/async-handler';
import { registerSchema } from '../validators/register.validator';
import { getRegisterController } from '../../../core/container';

const router = Router();

router.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(getRegisterController().register)
);

export default router;
