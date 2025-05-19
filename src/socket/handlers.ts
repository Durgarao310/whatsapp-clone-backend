import { Server, Socket } from 'socket.io';
import { PrivateMessagePayload, MessageSeenPayload, CallSignalPayload, CallStatusPayload, AuthedSocket } from '../types';
import { createMessage, markMessageSeen } from '../services/message.service';
import { setUserOnline, setUserOffline, getUserById } from '../services/user.service';
import { createCall, updateCallStatus } from '../services/call.service';
import { asyncatch } from '../helpers/asyncatch';
import { logger } from '../index';

export function registerSocketHandlers(io: Server) {
  io.on('connection', async (socket: Socket) => {
    const authedSocket = socket as AuthedSocket;
    const user = authedSocket.user;
    const [onlineUser, onlineErr] = await asyncatch(setUserOnline(user.id, socket.id));
    if (onlineErr) {
      socket.emit('error', { message: 'Failed to set user online' });
    } else if (user) {
      io.emit('user-online', { userId: user.id });
    }

    socket.on('private-message', async (payload: PrivateMessagePayload) => {
      const [message, msgErr] = await asyncatch(createMessage(payload.senderId, payload.receiverId, payload.content));
      if (msgErr) return socket.emit('error', { message: 'Failed to send message' });
      const [receiver, recvErr] = await asyncatch(getUserById(payload.receiverId));
      if (!recvErr && receiver?.socketIds && receiver.socketIds.length > 0) {
        receiver.socketIds.forEach((sid: string) => io.to(sid).emit('private-message', message));
      }
    });

    socket.on('message-seen', async (payload: MessageSeenPayload) => {
      const [updated, seenErr] = await asyncatch(markMessageSeen(payload.messageId, payload.userId));
      if (seenErr) return socket.emit('error', { message: 'Failed to mark message as seen' });
      if (updated) {
        const [sender, senderErr] = await asyncatch(getUserById(updated.sender.toString()));
        if (!senderErr && sender?.socketIds && sender.socketIds.length > 0) {
          sender.socketIds.forEach((sid: string) => io.to(sid).emit('message-seen', { messageId: updated._id }));
        }
      }
    });

    // WebRTC signaling
    socket.on('call-user', async (payload: CallSignalPayload) => {
      const [call, callErr] = await asyncatch(createCall(payload.callerId, payload.calleeId));
      if (callErr || !call) return socket.emit('error', { message: 'Failed to initiate call' });
      const [callee, calleeErr] = await asyncatch(getUserById(payload.calleeId));
      if (!calleeErr && callee?.socketIds && callee.socketIds.length > 0) {
        callee.socketIds.forEach((sid: string) => io.to(sid).emit('call-user', { ...payload, callId: call._id }));
      }
    });

    socket.on('answer-call', async (payload: CallSignalPayload & { callId: string }) => {
      const [caller, callerErr] = await asyncatch(getUserById(payload.callerId));
      if (callerErr) return socket.emit('error', { message: 'Failed to answer call' });
      if (caller?.socketIds && caller.socketIds.length > 0) {
        caller.socketIds.forEach((sid: string) => io.to(sid).emit('answer-call', payload));
      }
    });

    socket.on('ice-candidate', async (payload: CallSignalPayload) => {
      const [callee, calleeErr] = await asyncatch(getUserById(payload.calleeId));
      if (calleeErr) return socket.emit('error', { message: 'Failed to send ICE candidate' });
      if (callee?.socketIds && callee.socketIds.length > 0) {
        callee.socketIds.forEach((sid: string) => io.to(sid).emit('ice-candidate', payload));
      }
    });

    socket.on('end-call', async (payload: CallStatusPayload & { userId: string; peerId: string }) => {
      const [_, endErr] = await asyncatch(updateCallStatus(payload.callId, payload.status));
      if (endErr) return socket.emit('error', { message: 'Failed to end call' });
      const [peer, peerErr] = await asyncatch(getUserById(payload.peerId));
      if (!peerErr && peer?.socketIds && peer.socketIds.length > 0) {
        peer.socketIds.forEach((sid: string) => io.to(sid).emit('end-call', payload));
      }
    });

    socket.on('disconnect', async () => {
      const [_, offErr] = await asyncatch(setUserOffline(user.id, socket.id));
      if (!offErr && user) {
        const [updatedUser] = await asyncatch(getUserById(user.id));
        if (!updatedUser?.socketIds || updatedUser.socketIds.length === 0) {
          io.emit('user-offline', { userId: user.id });
        }
      } else if (offErr && process.env.NODE_ENV === 'development') {
        logger.error('Socket disconnect error:', offErr);
      }
    });
  });
  // Note: For production, restrict CORS origins in Socket.IO setup.
  // TODO: Support multiple socket IDs per user for multi-device/multi-tab scenarios.
  // Current implementation only supports a single socketId per user.
}
