import Call from '../models/Call';
import { Response } from 'express';
import { AuthedRequest } from '../types';
import catchAsync from '../helpers/catchAsync';

export const getCallHistory = catchAsync(async (req: AuthedRequest, res: Response) => {
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
});
