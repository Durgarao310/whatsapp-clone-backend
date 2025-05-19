import catchAsync from '../helpers/catchAsync';
import { AuthedRequest } from '../types';
import { addContactService, removeContactService } from '../services/contact.service';

// Add a user to contacts
export const addContact = catchAsync<AuthedRequest>(async (req, res) => {
  const userId = req.user?.id;
  const { contactId } = req.body;
  const result = await addContactService(userId, contactId);
  res.json({ message: 'Contact added', contactId: result });
});

// Remove a user from contacts
export const removeContact = catchAsync<AuthedRequest>(async (req, res) => {
  const userId = req.user?.id;
  const { contactId } = req.body;
  const result = await removeContactService(userId, contactId);
  res.json({ message: 'Contact removed', contactId: result });
});
