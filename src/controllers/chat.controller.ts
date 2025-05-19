import { AuthedRequest } from '../types';
import { getUserContacts } from '../services/chat.service';
import catchAsync from '../helpers/catchAsync';

export const getContacts = catchAsync<AuthedRequest>(async (req, res) => {
  const userId = req.user.id;
  const contacts = await getUserContacts(userId);
  res.json(contacts);
});
