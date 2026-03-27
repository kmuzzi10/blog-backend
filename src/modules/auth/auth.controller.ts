import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body, req.file);
    sendSuccess(res, result, 'Registration successful', 201);
  });

  registerAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.registerAdmin(req.body);
    sendSuccess(res, result, 'Admin account created successfully', 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await this.authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.changePassword(req.user!.userId, req.body);
    sendSuccess(res, null, 'Password changed successfully');
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.getMe(req.user!.userId);
    sendSuccess(res, user, 'Profile retrieved');
  });
}
