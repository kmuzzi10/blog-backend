import { Request, Response } from 'express';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse';
import { IBlobStorageService } from '../../domain/interfaces/IBlobStorageService';
import { UserStatus } from '../../domain/entities/User';

export class UserController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly blobStorageService?: IBlobStorageService,
  ) {}

  getAuthorDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const dashboardData = await this.userRepository.getAuthorDashboard(userId);
    sendSuccess(res, dashboardData, 'Author dashboard data retrieved successfully');
  });

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const { users, total } = await this.userRepository.findAll({ page, limit, role, search });
    
    return sendPaginated(res, users, total, page, limit, 'Users retrieved successfully');
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userRepository.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return sendSuccess(res, user, 'User retrieved successfully');
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedUser = await this.userRepository.update(id, req.body);

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return sendSuccess(res, updatedUser, 'User updated successfully');
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await this.userRepository.delete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return sendSuccess(res, null, 'User deleted successfully');
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const existingUser = await this.userRepository.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updateData: any = { ...req.body };

    // Handle avatar upload if file is present
    if (req.file && this.blobStorageService) {
      const uploadResult = await this.blobStorageService.upload(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'avatars'
      );
      
      // Optionally delete old avatar from blob storage if it exists
      if (existingUser.avatar) {
        this.blobStorageService.delete(existingUser.avatar).catch(() => {});
      }
      
      updateData.avatar = uploadResult.url;
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    const { password: _, ...userPublic } = updatedUser as any;
    return sendSuccess(res, userPublic, 'Profile updated successfully');
  });

  getAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
    const dashboardData = await this.userRepository.getAdminDashboard();
    return sendSuccess(res, dashboardData, 'Admin dashboard data retrieved successfully');
  });

  disableUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.userRepository.moderateStatus(id, UserStatus.DISABLED);
    return sendSuccess(res, null, 'User has been disabled successfully');
  });

  enableUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.userRepository.moderateStatus(id, UserStatus.ACTIVE);
    return sendSuccess(res, null, 'User has been re-enabled successfully');
  });

  deleteUserModerate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.userRepository.moderateStatus(id, UserStatus.DELETED);
    return sendSuccess(res, null, 'User and all their content have been deleted by admin');
  });
}
