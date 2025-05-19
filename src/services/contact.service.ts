import User from '../models/User';
import { logger } from '../index';

export async function addContactService(userId: string, contactId: string) {
  const user = await User.findById(userId);
  if (!user) {
    logger.error('Error finding user in addContactService');
    throw new Error('User not found');
  }
  if (user.contacts && user.contacts.map((id: any) => id.toString()).includes(contactId)) {
    throw new Error('Contact already exists');
  }
  user.contacts = user.contacts || [];
  user.contacts.push(contactId);
  await user.save();
  return contactId;
}

export async function removeContactService(userId: string, contactId: string) {
  const user = await User.findById(userId);
  if (!user) {
    logger.error('Error finding user in removeContactService');
    throw new Error('User not found');
  }
  user.contacts = (user.contacts || []).filter((id: any) => id.toString() !== contactId);
  await user.save();
  return contactId;
}
