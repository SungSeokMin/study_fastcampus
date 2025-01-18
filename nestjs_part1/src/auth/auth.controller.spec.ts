import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/user/entity/user.entity';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  blockToken: jest.fn(),
  issueToken: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const basicToken = 'Basic abcdefghijklmn';
      const user = { id: 1, email: 'sung@gmail.com' };

      jest.spyOn(authService, 'register').mockResolvedValue(user as User);

      expect(authController.registerUser(basicToken)).resolves.toEqual(user);
      expect(authService.register).toHaveBeenCalledWith(basicToken);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const basicToken = 'Basic abcdefghijklmn';

      const token = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(token);

      expect(authController.loginUser(basicToken)).resolves.toEqual(token);
      expect(authService.login).toHaveBeenCalledWith(basicToken);
    });
  });

  describe('blockToken', () => {
    it('should block a token', async () => {
      const token = 'blockToken';

      jest.spyOn(authService, 'blockToken').mockResolvedValue(true);

      expect(authController.blockToken(token)).resolves.toBe(true);
      expect(authService.blockToken).toHaveBeenCalledWith(token);
    });
  });

  describe('rotateAccessToken', () => {
    it('should rotate access token', async () => {
      const user = {
        sub: 1,
        role: 0,
        type: 'access',
        iat: 1737180742,
        exp: 1737181042,
      };
      const accessToken = 'accessToken';

      jest.spyOn(authService, 'issueToken').mockResolvedValue(accessToken);

      const result = await authController.rotateAccessToken({ user });

      expect(authService.issueToken).toHaveBeenCalledWith(user, false);
      expect(result).toEqual({ accessToken });
    });
  });
});
