import { Router } from 'express';
import { database } from '../config/database';
import authRoutes from '../modules/auth/routes/auth.routes';
import userRoutes from '../modules/user/routes/user.routes';

const router = Router();

router.get('/health', async (_, res) => {
  await database.client.$queryRaw`SELECT 1`;

  res.json({
    success: true,
    message: 'Database Connected',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
