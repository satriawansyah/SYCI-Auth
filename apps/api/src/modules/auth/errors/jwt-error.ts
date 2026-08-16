import { AppError } from '../../../core/errors/app-error';

export enum JwtErrorReason {
  NO_TOKEN = 'NO_TOKEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  INVALID_TYPE = 'INVALID_TYPE',
  MALFORMED_TOKEN = 'MALFORMED_TOKEN',
}

export class JwtError extends AppError {
  readonly reason: JwtErrorReason;

  constructor(reason: JwtErrorReason, message?: string) {
    const defaultMessages: Record<JwtErrorReason, string> = {
      [JwtErrorReason.NO_TOKEN]: 'Authentication token is missing',
      [JwtErrorReason.INVALID_TOKEN]: 'Authentication token is invalid',
      [JwtErrorReason.EXPIRED_TOKEN]: 'Authentication token has expired',
      [JwtErrorReason.INVALID_SIGNATURE]: 'Token signature is invalid',
      [JwtErrorReason.INVALID_TYPE]: 'Token type is invalid for this operation',
      [JwtErrorReason.MALFORMED_TOKEN]: 'Token format is malformed',
    };

    super(401, message || defaultMessages[reason]);
    this.reason = reason;
  }
}
