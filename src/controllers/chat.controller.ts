import { AuthedRequest } from '../types';
import { getUserContacts } from '../services/chat.service';
import catchAsync from '../helpers/catchAsync';
import { AppError } from '../middlewares/error.middleware';

/**
 * @route   GET /api/chats
 * @desc    Get all contacts for the authenticated user
 * @returns { success: true, data: Contact[] } on success
 * @returns { success: false, message: string } on error
 */
export const getContacts = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }
  const userId = req.user.id;
  const contacts = await getUserContacts(userId);
  res.json({
    success: true,
    data: contacts
  });
});
