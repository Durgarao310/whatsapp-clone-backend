/**
 * @route GET /api/user/profile
 * @desc Get the authenticated user's profile
 * @returns { success: true, data: { user: { id, username, online, socketIds, contacts } } } on success
 * @returns { success: false, message: string } on error
 */
import { AuthedRequest } from '../types';
import catchAsync from '../helpers/catchAsync';
import { AppError } from '../middlewares/error.middleware';
import User from '../models/User';

export const getUserProfile = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) {
    // Consistent error handling
    throw new AppError('Unauthorized', 401);
  }
  const user = await User.findById(req.user.id).select('username online socketIds contacts');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        online: user.online,
        socketIds: user.socketIds,
        contacts: user.contacts
      }
    }
  });
});
