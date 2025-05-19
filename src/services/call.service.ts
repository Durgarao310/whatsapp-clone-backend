import Call, { CallStatus } from '../models/Call';
import { asyncatch } from '../helpers/asyncatch';
import { saveDoc } from '../helpers/document';
import { logger } from '../index';

export async function createCall(callerId: string, calleeId: string) {
  const [call, err] = await asyncatch(Call.create({ caller: callerId, callee: calleeId, status: 'ongoing' }));
  if (err) {
    logger.error('Error in createCall', err);
    throw err;
  }
  return call;
}

export async function updateCallStatus(callId: string, status: CallStatus) {
  const [call, findErr] = await asyncatch(Call.findById(callId));
  if (findErr) {
    logger.error('Error in updateCallStatus (find)', findErr);
    throw findErr;
  }
  if (call) {
    call.status = status;
    if (status !== 'ongoing') {
      call.endedAt = new Date();
    }
    const [saved, saveErr] = await saveDoc(call);
    if (saveErr) {
      logger.error('Error in updateCallStatus (save)', saveErr);
      throw saveErr;
    }
    return saved;
  }
  return null;
}

export async function getOngoingCallBetweenUsers(userA: string, userB: string) {
  const [call, err] = await asyncatch(Call.findOne({
    $or: [
      { caller: userA, callee: userB, status: 'ongoing' },
      { caller: userB, callee: userA, status: 'ongoing' },
    ],
  }));
  if (err) {
    logger.error('Error in getOngoingCallBetweenUsers', err);
    throw err;
  }
  return call;
}
