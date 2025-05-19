import catchAsync from '../helpers/catchAsync';
import { getMessagesBetweenUsers } from '../services/message.service';
import { getStringFromQuery, getNumberFromQuery } from '../helpers/validation';
import { AuthedRequest } from '../types';
import httpStatus from 'http-status';

export const getMessages = catchAsync<AuthedRequest>(async (req, res) => {
  const userId = req.user.id;
  const withUserId = getStringFromQuery(req.query.withUserId);
  const limitNum = getNumberFromQuery(req.query.limit, 20);
  const pageNum = getNumberFromQuery(req.query.page, 1);
  if (!withUserId) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'withUserId is required' });
    return;
  }
  const result = await getMessagesBetweenUsers(userId, withUserId, { limit: limitNum, page: pageNum });
  const messages = result?.messages ?? [];
  const total = result?.total ?? 0;
  res.status(httpStatus.OK).json({
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
  });
});
