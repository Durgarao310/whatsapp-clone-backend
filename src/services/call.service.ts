import Call, { CallStatus } from '../models/Call';
import { saveDoc } from '../helpers/document';
import { logger } from '../index';

export async function createCall(callerId: string, calleeId: string) {
  try {
    const call = await Call.create({ caller: callerId, callee: calleeId, status: 'ongoing' });
    return call;
  } catch (err) {
    logger.error('Error in createCall', err);
    throw err;
  }
}

export async function updateCallStatus(callId: string, status: CallStatus) {
  try {
    const call = await Call.findById(callId);
    if (call) {
      call.status = status;
      if (status !== 'ongoing') {
        call.endedAt = new Date();
      }
      try {
        const saved = await saveDoc(call);
        return saved;
      } catch (saveErr) {
        logger.error('Error in updateCallStatus (save)', saveErr);
        throw saveErr;
      }
    }
    return null;
  } catch (findErr) {
    logger.error('Error in updateCallStatus (find)', findErr);
    throw findErr;
  }
}

export async function getOngoingCallBetweenUsers(userA: string, userB: string) {
  try {
    const call = await Call.findOne({
      $or: [
        { caller: userA, callee: userB, status: 'ongoing' },
        { caller: userB, callee: userA, status: 'ongoing' },
      ],
    });
    return call;
  } catch (err) {
    logger.error('Error in getOngoingCallBetweenUsers', err);
    throw err;
  }
}
