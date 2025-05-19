import Call from '../models/Call';
import { Response } from 'express';
import { AuthedRequest } from '../types';
import catchAsync from '../helpers/catchAsync';
import { AppError } from '../middlewares/error.middleware';

/**
 * @route GET /api/calls
 * @desc Get call history for the authenticated user
 * @returns { success: true, data: Call[] } on success
 * @returns { success: false, message: string } on error
 */
export const getCallHistory = catchAsync(async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }
  const userId = req.user.id;
  const calls = await Call.find({
    $or: [
      { caller: userId },
      { callee: userId },
    ],
  })
    .sort({ startedAt: -1 })
    .populate('caller', 'id username online socketIds')
    .populate('callee', 'id username online socketIds')
    .lean();
  res.json({
    success: true,
    data: calls.map(call => ({
      id: call._id,
      caller: call.caller,
      callee: call.callee,
      status: call.status,
      startedAt: call.startedAt,
      endedAt: call.endedAt
    }))
  });
});
