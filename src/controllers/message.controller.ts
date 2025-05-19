import catchAsync from '../helpers/catchAsync';
import { getMessagesBetweenUsers } from '../services/message.service';
import { getStringFromQuery, getNumberFromQuery } from '../helpers/validation';
import { AuthedRequest } from '../types';
import httpStatus from 'http-status';
import { AppError } from '../middlewares/error.middleware';

/**
 * @route GET /api/messages
 * @desc Get messages between the authenticated user and another user
 * @returns { success: true, data: { messages, pagination } } on success
 * @returns { success: false, message: string } on error
 */
export const getMessages = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }
  const userId = req.user.id;
  const withUserId = getStringFromQuery(req.query.withUserId);
  const limitNum = getNumberFromQuery(req.query.limit, 20);
  const pageNum = getNumberFromQuery(req.query.page, 1);
  if (!withUserId) {
    throw new AppError('withUserId is required', 400);
  }
  const result = await getMessagesBetweenUsers(userId, withUserId, { limit: limitNum, page: pageNum });
  const messages = result?.messages ?? [];
  const total = result?.total ?? 0;
  res.status(200).json({
    success: true,
    data: {
      messages: messages.map(msg => ({
        id: msg._id,
        sender: msg.sender,
        receiver: msg.receiver,
        content: msg.content,
        seen: msg.seen,
        createdAt: msg.createdAt
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrevious: pageNum > 1
      }
    }
  });
});
