import { Router } from 'express';
import { database } from '../config/database';
import authRoutes from '../modules/auth/routes/auth.routes';

const router = Router();

router.get('/health', async (_, res) => {
  await database.client.$queryRaw`SELECT 1`;

  res.json({
    success: true,
    message: 'Database Connected',
  });
});

router.use('/auth', authRoutes);

export default router;
