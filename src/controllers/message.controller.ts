import { Response } from 'express';
import { validationResult } from 'express-validator';
import httpStatus from 'http-status';
import { AuthedRequest } from '../types';
import { logger } from '../index';
import { getMessagesBetweenUsers } from '../services/message.service';

export async function getMessages(req: AuthedRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Validation error', errors: errors.array() });
    return;
  }
  try {
    const userId = req.user.id;
    const { withUserId } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const result = await getMessagesBetweenUsers(userId, withUserId as string, { limit, page });
    const messages = result?.messages ?? [];
    const total = result?.total ?? 0;
    res.json({
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
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1
      }
    });
  } catch (err) {
    logger.error('Failed to fetch messages', err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch messages', error: err instanceof Error ? err.message : err });
  }
}
