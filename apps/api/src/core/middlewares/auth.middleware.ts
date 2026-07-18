import type { NextFunction, Request, Response } from 'express';
import { getAuthRepository, getJwtService } from '../container';
import { AppError } from '../errors/app-error';
import { TokenType } from '../../shared/enums/token-type.enum';
import type { AccessTokenPayload } from '../../shared/types/jwt-payload.type';
import type { AuthenticatedRequest } from '../../shared/types/authenticated-request.type';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentication token is missing');
  }

  const token = authorization.slice('Bearer '.length).trim();
  const payload = getJwtService().verify<AccessTokenPayload>(
    token,
    TokenType.ACCESS
  );
  const session = await getAuthRepository().findSessionById(payload.sid);

  if (
    !session ||
    session.userId !== payload.sub ||
    session.revokedAt ||
    session.expiresAt <= new Date()
  ) {
    throw new AppError(401, 'Authentication session is invalid');
  }

  (req as AuthenticatedRequest).auth = {
    userId: payload.sub,
    sessionId: payload.sid,
    roles: [],
    permissions: [],
  };
  next();
}
