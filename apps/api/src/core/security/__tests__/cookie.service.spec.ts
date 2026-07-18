import type { Request, Response } from 'express';
import { CookieService } from '../cookie.service';
import { CookieError, CookieErrorReason } from '../../../modules/auth/errors/cookie-error';
import { CookieConfig } from '../../../shared/types/cookie-config.type';

describe('CookieService', () => {
  let cookieService: CookieService;
  const mockConfig: CookieConfig = {
    name: 'syci_refresh_token',
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };

  beforeEach(() => {
    cookieService = new CookieService(mockConfig);
  });

  describe('Constructor & Validation', () => {
    it('should create service with valid config', () => {
      expect(cookieService).toBeDefined();
    });

    it('should throw error if cookie name is empty', () => {
      expect(
        () =>
          new CookieService({
            ...mockConfig,
            name: '',
          })
      ).toThrow('Cookie name must be defined and non-empty');
    });

    it('should throw error if maxAge is zero', () => {
      expect(
        () =>
          new CookieService({
            ...mockConfig,
            maxAge: 0,
          })
      ).toThrow('Cookie maxAge must be greater than 0');
    });

    it('should throw error if maxAge is negative', () => {
      expect(
        () =>
          new CookieService({
            ...mockConfig,
            maxAge: -1000,
          })
      ).toThrow('Cookie maxAge must be greater than 0');
    });

    it('should throw error if sameSite is invalid', () => {
      expect(
        () =>
          new CookieService({
            ...mockConfig,
            sameSite: 'invalid' as any,
          })
      ).toThrow('SameSite must be one of: strict, lax, none');
    });

    it('should throw error if path is empty', () => {
      expect(
        () =>
          new CookieService({
            ...mockConfig,
            path: '',
          })
      ).toThrow('Cookie path must be defined and non-empty');
    });
  });

  describe('setRefreshTokenCookie', () => {
    it('should set cookie on response object', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const expiresAt = new Date();
      cookieService.setRefreshTokenCookie(mockResponse, 'test_token', expiresAt);

      expect(mockResponse.cookie).toHaveBeenCalledWith('syci_refresh_token', 'test_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/api/v1/auth',
        domain: undefined,
        expires: expiresAt,
      });
    });

    it('should set cookie with domain if provided', () => {
      const serviceWithDomain = new CookieService({
        ...mockConfig,
        domain: 'example.com',
      });

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const expiresAt = new Date();
      serviceWithDomain.setRefreshTokenCookie(mockResponse, 'test_token', expiresAt);

      expect(mockResponse.cookie).toHaveBeenCalledWith('syci_refresh_token', 'test_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/api/v1/auth',
        domain: 'example.com',
        expires: expiresAt,
      });
    });

    it('should throw error if response is invalid', () => {
      const invalidResponse = null as unknown as Response;
      expect(() =>
        cookieService.setRefreshTokenCookie(invalidResponse, 'test_token', new Date())
      ).toThrow(CookieError);
    });

    it('should throw error if response.cookie is not a function', () => {
      const mockResponse = {
        cookie: 'not_a_function',
      } as unknown as Response;

      expect(() =>
        cookieService.setRefreshTokenCookie(mockResponse, 'test_token', new Date())
      ).toThrow(CookieError);
    });

    it('should throw error if token is empty', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      expect(() =>
        cookieService.setRefreshTokenCookie(mockResponse, '', new Date())
      ).toThrow(CookieError);
    });

    it('should throw error if token is not a string', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      expect(() =>
        cookieService.setRefreshTokenCookie(mockResponse, null as any, new Date())
      ).toThrow(CookieError);
    });
  });

  describe('getRefreshTokenCookie', () => {
    it('should retrieve cookie from request', () => {
      const mockRequest = {
        cookies: {
          syci_refresh_token: 'test_token_123',
        },
      } as unknown as Request;

      const token = cookieService.getRefreshTokenCookie(mockRequest);
      expect(token).toBe('test_token_123');
    });

    it('should return null if cookie not present', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const token = cookieService.getRefreshTokenCookie(mockRequest);
      expect(token).toBeNull();
    });

    it('should throw error if request is invalid', () => {
      const invalidRequest = null as unknown as Request;
      expect(() => cookieService.getRefreshTokenCookie(invalidRequest)).toThrow(CookieError);
    });

    it('should throw error if cookies object is missing', () => {
      const mockRequest = {} as unknown as Request;
      expect(() => cookieService.getRefreshTokenCookie(mockRequest)).toThrow(CookieError);
    });

    it('should throw error if cookie value is empty', () => {
      const mockRequest = {
        cookies: {
          syci_refresh_token: '',
        },
      } as unknown as Request;

      expect(() => cookieService.getRefreshTokenCookie(mockRequest)).toThrow(CookieError);
    });

    it('should throw error if cookie value is not a string', () => {
      const mockRequest = {
        cookies: {
          syci_refresh_token: 12345,
        },
      } as unknown as Request;

      expect(() => cookieService.getRefreshTokenCookie(mockRequest)).toThrow(CookieError);
    });
  });

  describe('clearRefreshTokenCookie', () => {
    it('should set maxAge to 0 for deletion', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      cookieService.clearRefreshTokenCookie(mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('syci_refresh_token', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/api/v1/auth',
        domain: undefined,
        maxAge: 0,
      });
    });

    it('should throw error if response is invalid', () => {
      const invalidResponse = null as unknown as Response;
      expect(() => cookieService.clearRefreshTokenCookie(invalidResponse)).toThrow(CookieError);
    });
  });

  describe('setCookie (generic)', () => {
    it('should set cookie with custom name and options', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      cookieService.setCookie(mockResponse, 'custom_cookie', 'custom_value', {
        httpOnly: false,
        maxAge: 3600000,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith('custom_cookie', 'custom_value', {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
        path: '/api/v1/auth',
        domain: undefined,
        maxAge: 3600000,
      });
    });

    it('should use default options if not provided', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      cookieService.setCookie(mockResponse, 'test', 'value', {});

      expect(mockResponse.cookie).toHaveBeenCalledWith('test', 'value', expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        path: '/api/v1/auth',
      }));
    });

    it('should throw error if cookie name is empty', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      expect(() => cookieService.setCookie(mockResponse, '', 'value', {})).toThrow();
    });
  });

  describe('getCookie (generic)', () => {
    it('should retrieve custom cookie from request', () => {
      const mockRequest = {
        cookies: {
          custom_cookie: 'custom_value',
        },
      } as unknown as Request;

      const value = cookieService.getCookie(mockRequest, 'custom_cookie');
      expect(value).toBe('custom_value');
    });

    it('should return null if cookie not present', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const value = cookieService.getCookie(mockRequest, 'nonexistent');
      expect(value).toBeNull();
    });

    it('should throw error if cookie name is empty', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      expect(() => cookieService.getCookie(mockRequest, '')).toThrow();
    });
  });

  describe('clearCookie (generic)', () => {
    it('should clear cookie using clearCookie method', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      cookieService.clearCookie(mockResponse, 'test_cookie');

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('test_cookie', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/api/v1/auth',
        domain: undefined,
      });
    });

    it('should throw error if cookie name is empty', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      expect(() => cookieService.clearCookie(mockResponse, '')).toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full cookie lifecycle', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      // Set cookie
      const expiresAt = new Date();
      cookieService.setRefreshTokenCookie(mockResponse, 'lifecycle_token', expiresAt);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'syci_refresh_token',
        'lifecycle_token',
        expect.anything()
      );

      // Get cookie
      const mockRequest = {
        cookies: {
          syci_refresh_token: 'lifecycle_token',
        },
      } as unknown as Request;

      const token = cookieService.getRefreshTokenCookie(mockRequest);
      expect(token).toBe('lifecycle_token');

      // Clear cookie
      const mockClearResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      cookieService.clearRefreshTokenCookie(mockClearResponse);
      expect(mockClearResponse.cookie).toHaveBeenCalledWith(
        'syci_refresh_token',
        '',
        expect.objectContaining({ maxAge: 0 })
      );
    });

    it('should handle multiple cookies independently', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      // Set refresh token
      cookieService.setRefreshTokenCookie(mockResponse, 'refresh_token', new Date());

      // Set custom cookie
      cookieService.setCookie(mockResponse, 'access_token_meta', 'metadata', {});

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('Security Properties', () => {
    it('should set HttpOnly flag for XSS protection', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      cookieService.setRefreshTokenCookie(mockResponse, 'token', new Date());

      const callArgs = mockResponse.cookie.mock.calls[0][2];
      expect(callArgs.httpOnly).toBe(true);
    });

    it('should set Secure flag to true in production', () => {
      const prodService = new CookieService({
        ...mockConfig,
        secure: true,
      });

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      prodService.setRefreshTokenCookie(mockResponse, 'token', new Date());

      const callArgs = mockResponse.cookie.mock.calls[0][2];
      expect(callArgs.secure).toBe(true);
    });

    it('should set SameSite=Strict for CSRF protection', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      cookieService.setRefreshTokenCookie(mockResponse, 'token', new Date());

      const callArgs = mockResponse.cookie.mock.calls[0][2];
      expect(callArgs.sameSite).toBe('strict');
    });

    it('should restrict cookie path to auth endpoints', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      cookieService.setRefreshTokenCookie(mockResponse, 'token', new Date());

      const callArgs = mockResponse.cookie.mock.calls[0][2];
      expect(callArgs.path).toBe('/api/v1/auth');
    });
  });
});
