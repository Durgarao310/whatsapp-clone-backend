import Call, { CallStatus } from '../models/Call';
import { saveDoc } from '../helpers/document';

export async function createCall(callerId: string, calleeId: string) {
  return await Call.create({ caller: callerId, callee: calleeId, status: 'ongoing' });
}

export async function updateCallStatus(callId: string, status: CallStatus) {
  const call = await Call.findById(callId);
  if (call) {
    call.status = status;
    if (status !== 'ongoing') {
      call.endedAt = new Date();
    }
    const saved = await saveDoc(call);
    return saved;
  }
  return null;
}

export async function getOngoingCallBetweenUsers(userA: string, userB: string) {
  return await Call.findOne({
    $or: [
      { caller: userA, callee: userB, status: 'ongoing' },
      { caller: userB, callee: userA, status: 'ongoing' },
    ],
  });
}
