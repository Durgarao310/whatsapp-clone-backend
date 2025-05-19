import { AuthedRequest } from '../types';
import catchAsync from '../helpers/catchAsync';

// Example controller: Get user profile
export const getUserProfile = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const userId = req.user.id;
  res.status(200).json({
    message: 'User profile fetched successfully',
    user: {
      id: userId,
      username: req.user.username
    }
  });
});
