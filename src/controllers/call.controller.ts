import Call from '../models/Call';
import { Response } from 'express';
import { AuthedRequest } from '../types';
import httpStatus from 'http-status';
import { logger } from '../index';

export async function getCallHistory(req: AuthedRequest, res: Response) {
  try {
    const userId = req.user.id;
    const calls = await Call.find({
      $or: [
        { caller: userId },
        { callee: userId },
      ],
    }).sort({ startedAt: -1 });
    res.json(calls.map(call => ({
      id: call._id,
      caller: call.caller,
      callee: call.callee,
      status: call.status,
      startedAt: call.startedAt,
      endedAt: call.endedAt
    })));
  } catch (err) {
    logger.error('Failed to fetch call history', err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch call history', error: err instanceof Error ? err.message : err });
  }
}
