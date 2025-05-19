import { Server, Socket } from 'socket.io';
import { 
  PrivateMessagePayload, 
  MessageSeenPayload, 
  CallSignalPayload, 
  CallStatusPayload, 
  AuthedSocket, 
  FriendRequestPayload, 
  TypingPayload, 
  FriendRequestActionPayload, 
  MessageReadPayload 
} from '../types'; 
import { createMessage, markMessageSeen } from '../services/message.service';
import { setUserOnline, setUserOffline, getUserById } from '../services/user.service';
import { createCall, updateCallStatus } from '../services/call.service';
import * as contactService from '../services/contact.service'; // Import contact services
import logger from '../helpers/logger';

function emitSocketError(socket: Socket, message: string, code?: string) {
  socket.emit('operation-error', { message, code });
}

export function registerSocketHandlers(io: Server) {
  io.on('connection', async (socket: Socket) => {
    const authedSocket = socket as AuthedSocket;
    const user = authedSocket.user;
    if (!user) {
      logger.error('Socket: No user found on socket');
      socket.disconnect();
      return;
    }
    try {
      await setUserOnline(user.id, socket.id);
      io.emit('user-online', { userId: user.id });
    } catch (onlineErr: any) {
      logger.error('Socket: Failed to set user online', { error: onlineErr, userId: user.id });
      emitSocketError(socket, onlineErr?.message || 'Failed to set user online', 'USER_ONLINE_ERROR');
    }

    socket.on('private-message', async (payload: PrivateMessagePayload) => {
      if (!payload || !payload.senderId || !payload.receiverId || typeof payload.content !== 'string') {
        logger.warn('Socket: Invalid private-message payload', { payload });
        return emitSocketError(socket, 'Invalid payload for private-message', 'INVALID_PAYLOAD');
      }
      try {
        const message = await createMessage(payload.senderId, payload.receiverId, payload.content);
        const receiver = await getUserById(payload.receiverId);
        if (receiver?.socketIds && receiver.socketIds.length > 0) {
          receiver.socketIds.forEach((sid: string) => io.to(sid).emit('private-message', message));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to send message', { error: err, senderId: payload.senderId, receiverId: payload.receiverId });
        emitSocketError(socket, err?.message || 'Failed to send message', 'SEND_MESSAGE_ERROR');
      }
    });

    socket.on('message-seen', async (payload: MessageSeenPayload) => {
      if (!payload || !payload.messageId || !payload.userId) {
        logger.warn('Socket: Invalid message-seen payload', { payload });
        return emitSocketError(socket, 'Invalid payload for message-seen', 'INVALID_PAYLOAD');
      }
      try {
        const updated = await markMessageSeen(payload.messageId, payload.userId);
        if (updated) {
          const sender = await getUserById(updated.sender.toString());
          if (sender?.socketIds && sender.socketIds.length > 0) {
            sender.socketIds.forEach((sid: string) => io.to(sid).emit('message-seen', { messageId: updated._id, readerId: payload.userId }));
          }
        }
      } catch (err: any) {
        logger.error('Socket: Failed to mark message as seen', {
          error: err,
          messageId: payload.messageId,
          userId: payload.userId
        });
        emitSocketError(socket, err?.message || 'Failed to mark message as seen', 'MESSAGE_SEEN_ERROR');
      }
    });

    socket.on('message_read', async (payload: MessageReadPayload, callback) => {
      if (!payload || !payload.messageId) {
        logger.warn('Socket: Invalid message_read payload', { payload, userId: user.id });
        callback?.({ success: false, message: 'Invalid payload for message_read' }); 
        return emitSocketError(socket, 'Invalid payload for message_read', 'INVALID_PAYLOAD');
      }
      try {
        const updated = await markMessageSeen(payload.messageId, user.id); // Mark as read by the current user
        if (updated) {
          const sender = await getUserById(updated.sender.toString());
          if (sender?.socketIds && sender.socketIds.length > 0) {
            sender.socketIds.forEach((sid: string) => io.to(sid).emit('message_read', { messageId: updated._id, readerId: user.id }));
          }
        }
        callback?.({ success: !!updated });
      } catch (err: any) {
        logger.error('Socket: Failed to mark message as read by user', { 
          error: err, 
          messageId: payload.messageId, 
          userId: user.id 
        });
        emitSocketError(socket, err?.message || 'Failed to mark message as read', 'MESSAGE_READ_ERROR');
        callback?.({ success: false, message: err?.message || 'Failed to mark message as read' });
      }
    });

    // WebRTC signaling
    socket.on('call-user', async (payload: CallSignalPayload) => {
      if (!payload || !payload.callerId || !payload.calleeId || !payload.signal) {
        logger.warn('Socket: Invalid call-user payload', { payload });
        return emitSocketError(socket, 'Invalid payload for call-user', 'INVALID_PAYLOAD');
      }
      try {
        const call = await createCall(payload.callerId, payload.calleeId);
        if (!call) throw new Error('Call creation failed during socket event'); // More specific error
        const callee = await getUserById(payload.calleeId);
        if (callee?.socketIds && callee.socketIds.length > 0) {
          callee.socketIds.forEach((sid: string) => io.to(sid).emit('call-user', { ...payload, callId: call._id }));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to initiate call', { 
          error: err, 
          callerId: payload.callerId,
          calleeId: payload.calleeId 
        });
        emitSocketError(socket, err?.message || 'Failed to initiate call', 'CALL_USER_ERROR');
      }
    });

    socket.on('answer-call', async (payload: CallSignalPayload & { callId: string }) => {
      if (!payload || !payload.callerId || !payload.calleeId || !payload.signal || !payload.callId) {
        logger.warn('Socket: Invalid answer-call payload', { payload });
        return emitSocketError(socket, 'Invalid payload for answer-call', 'INVALID_PAYLOAD');
      }
      try {
        const caller = await getUserById(payload.callerId);
        if (caller?.socketIds && caller.socketIds.length > 0) {
          caller.socketIds.forEach((sid: string) => io.to(sid).emit('answer-call', payload));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to answer call', { 
          error: err, 
          callerId: payload.callerId,
          calleeId: payload.calleeId,
          callId: payload.callId
        });
        emitSocketError(socket, err?.message || 'Failed to answer call', 'ANSWER_CALL_ERROR');
      }
    });

    socket.on('ice-candidate', async (payload: CallSignalPayload & { candidate: any }) => {
      if (!payload || !payload.calleeId || !payload.candidate) { 
        logger.warn('Socket: Invalid ice-candidate payload', { payload });
        return emitSocketError(socket, 'Invalid payload for ice-candidate', 'INVALID_PAYLOAD');
      }
      try {
        const targetUser = await getUserById(payload.calleeId); // Renamed for clarity
        if (targetUser?.socketIds && targetUser.socketIds.length > 0) {
          targetUser.socketIds.forEach((sid: string) => io.to(sid).emit('ice-candidate', payload));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to send ICE candidate', { 
          error: err, 
          calleeId: payload.calleeId,
          callerId: payload.callerId // Assuming callerId is also part of payload for context
        });
        emitSocketError(socket, err?.message || 'Failed to send ICE candidate', 'ICE_CANDIDATE_ERROR');
      }
    });

    socket.on('end-call', async (payload: CallStatusPayload & { peerId: string }) => {
      // userId is not in CallStatusPayload, it's from authedSocket.user.id if needed for service
      if (!payload || !payload.callId || !payload.status || !payload.peerId) {
        logger.warn('Socket: Invalid end-call payload', { payload });
        return emitSocketError(socket, 'Invalid payload for end-call', 'INVALID_PAYLOAD');
      }
      try {
        await updateCallStatus(payload.callId, payload.status); // user.id could be passed if service needs to know who initiated end-call
        const peer = await getUserById(payload.peerId);
        if (peer?.socketIds && peer.socketIds.length > 0) {
          peer.socketIds.forEach((sid: string) => io.to(sid).emit('end-call', {callId: payload.callId, status: payload.status}));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to end call', { 
          error: err, 
          callId: payload.callId,
          status: payload.status,
          peerId: payload.peerId,
          userId: user.id // User who triggered the end-call
        });
        emitSocketError(socket, err?.message || 'Failed to end call', 'END_CALL_ERROR');
      }
    });

    // --- Friend Request Real-Time Events ---
    socket.on('send_friend_request', async (payload: FriendRequestPayload, callback) => {
      const senderId = user.id;
      if (!payload || !payload.targetUserId) {
        logger.warn('Socket: Invalid send_friend_request payload', { payload, senderId });
        callback?.({ success: false, message: 'Invalid targetUserId' });
        return emitSocketError(socket, 'Invalid targetUserId', 'INVALID_PAYLOAD');
      }
      const { targetUserId } = payload;

      try {
        await contactService.sendFriendRequestService(senderId, targetUserId);
        logger.info('Socket: Friend request service call successful, event emitted by service', { senderId, targetUserId });
        callback?.({ success: true, message: 'Friend request sent successfully.' });
      } catch (error: any) {
        logger.error('Socket: Service failed to send friend request', { error: error, targetUserId, senderId });
        callback?.({ success: false, message: error?.message || 'Failed to send friend request' });
        // Optionally emit socket error back to sender if service error isn't specific enough for client
        // emitSocketError(socket, error?.message || 'Failed to send friend request', 'FRIEND_REQUEST_ERROR');
      }
    });

    socket.on('accept_friend_request', async (payload: FriendRequestActionPayload, callback) => {
      const accepterId = user.id;
      if (!payload || !payload.senderId) {
        logger.warn('Socket: Invalid accept_friend_request payload', { payload, accepterId });
        callback?.({ success: false, message: 'Invalid senderId' });
        return emitSocketError(socket, 'Invalid senderId', 'INVALID_PAYLOAD');
      }
      const { senderId } = payload;

      try {
        await contactService.acceptFriendRequestService(accepterId, senderId);
        logger.info('Socket: Accept friend request service call successful, event emitted by service', { accepterId, senderId });
        callback?.({ success: true, message: 'Friend request accepted.' });
      } catch (error: any) {
        logger.error('Socket: Service failed to accept friend request', { error: error, senderId, accepterId });
        callback?.({ success: false, message: error?.message || 'Failed to accept friend request' });
      }
    });

    socket.on('reject_friend_request', async (payload: FriendRequestActionPayload, callback) => {
      const rejecterId = user.id;
      if (!payload || !payload.senderId) {
        logger.warn('Socket: Invalid reject_friend_request payload', { payload, rejecterId });
        callback?.({ success: false, message: 'Invalid senderId' });
        return emitSocketError(socket, 'Invalid senderId', 'INVALID_PAYLOAD');
      }
      const { senderId } = payload;

      try {
        await contactService.rejectFriendRequestService(rejecterId, senderId);
        logger.info('Socket: Reject friend request service call successful, event emitted by service', { rejecterId, senderId });
        callback?.({ success: true, message: 'Friend request rejected.' });
      } catch (error: any) {
        logger.error('Socket: Service failed to reject friend request', { error: error, senderId, rejecterId });
        callback?.({ success: false, message: error?.message || 'Failed to reject friend request' });
      }
    });

    // --- Typing Indicators ---
    socket.on('typing', async (payload: TypingPayload, callback) => {
      const senderId = user.id;
      if (!payload || !payload.receiverId) {
        logger.warn('Socket: Invalid typing payload', { payload, senderId });
        callback?.({ success: false, message: 'Invalid receiverId' });
        return emitSocketError(socket, 'Invalid receiverId', 'INVALID_PAYLOAD');
      }
      const { receiverId } = payload;

      try {
        const receiver = await getUserById(receiverId);
        // Authorization: Ensure receiver is a contact of the sender
        if (!receiver || !receiver.contacts?.map((contact: any) => contact.toString()).includes(senderId)) {
          logger.warn('Socket: Typing event for invalid receiver or non-contact', { senderId, receiverId });
          callback?.({ success: false, message: 'Invalid receiver or not a contact' });
          return emitSocketError(socket, 'Cannot send typing indicator to this user', 'AUTH_ERROR');
        }
        if (receiver.socketIds && receiver.socketIds.length > 0) {
          receiver.socketIds.forEach((sid: string) => io.to(sid).emit('typing', { senderId, senderName: user.username }));
        }
        callback?.({ success: true });
      } catch (error: any) {
        logger.error('Socket: Failed to send typing event', { error: error, receiverId, senderId });
        callback?.({ success: false, message: error?.message || 'Failed to send typing event' });
      }
    });

    socket.on('stop_typing', async (payload: TypingPayload, callback) => {
      const senderId = user.id;
      if (!payload || !payload.receiverId) {
        logger.warn('Socket: Invalid stop_typing payload', { payload, senderId });
        callback?.({ success: false, message: 'Invalid receiverId' });
        return emitSocketError(socket, 'Invalid receiverId', 'INVALID_PAYLOAD');
      }
      const { receiverId } = payload;

      try {
        const receiver = await getUserById(receiverId);
        // Authorization: Ensure receiver is a contact of the sender
        if (!receiver || !receiver.contacts?.map((contact: any) => contact.toString()).includes(senderId)) {
          logger.warn('Socket: Stop typing event for invalid receiver or non-contact', { senderId, receiverId });
          callback?.({ success: false, message: 'Invalid receiver or not a contact' });
          return emitSocketError(socket, 'Cannot send stop typing indicator to this user', 'AUTH_ERROR');
        }
        if (receiver.socketIds && receiver.socketIds.length > 0) {
          receiver.socketIds.forEach((sid: string) => io.to(sid).emit('stop_typing', { senderId }));
        }
        callback?.({ success: true });
      } catch (error: any) {
        logger.error('Socket: Failed to send stop typing event', { error: error, receiverId, senderId });
        callback?.({ success: false, message: error?.message || 'Failed to send stop typing event' });
      }
    });

    socket.on('disconnect', async () => {
      try {
        await setUserOffline(user.id, socket.id);
        const updatedUser = await getUserById(user.id); // Check if user has any other active sockets
        if (!updatedUser?.socketIds || updatedUser.socketIds.length === 0) {
          io.emit('user-offline', { userId: user.id });
        }
        logger.info('Socket: User disconnected and status updated', { userId: user.id, socketId: socket.id });
      } catch (offErr: any) {
        logger.error('Socket: Error during disconnect process', { error: offErr, userId: user.id, socketId: socket.id });
      }
    });
  });
}

