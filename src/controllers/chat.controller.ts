import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthedRequest } from '../types';
import { logger } from '../index';
import { getUserContacts } from '../services/chat.service';

export async function getContacts(req: AuthedRequest, res: Response) {
  try {
    const userId = req.user.id;
    const contacts = await getUserContacts(userId);
    res.json(contacts);
  } catch (err) {
    logger.error('Failed to fetch contacts', err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch contacts', error: err instanceof Error ? err.message : err });
  }
}
