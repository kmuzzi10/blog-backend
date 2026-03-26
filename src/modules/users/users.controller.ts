import { Request, Response } from 'express';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse';
import { NotFoundError } from '../../shared/utils/AppError';

export class UserController {
  constructor(private readonly userRepository: IUserRepository) {}

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const role = req.query.role as string;

    const { users, total } = await this.userRepository.findAll({ page, limit, role });
    sendPaginated(res, users, total, page, limit, 'Users retrieved successfully');
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Omit sensitive data
    const { password: _, ...userPublic } = user as any;
    sendSuccess(res, userPublic, 'User retrieved successfully');
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Admins can deactivate users or change roles
    const updateData = req.body;

    const user = await this.userRepository.update(id, updateData);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userPublic } = user as any;
    sendSuccess(res, userPublic, 'User updated successfully');
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await this.userRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError('User not found');
    }

    sendSuccess(res, null, 'User deleted successfully');
  });
}
