import { Server, Socket } from 'socket.io';
import { PrivateMessagePayload, MessageSeenPayload, CallSignalPayload, CallStatusPayload, AuthedSocket } from '../types';
import { createMessage, markMessageSeen } from '../services/message.service';
import { setUserOnline, setUserOffline, getUserById } from '../services/user.service';
import { createCall, updateCallStatus } from '../services/call.service';
import { logger } from '../index';

function emitSocketError(socket: Socket, message: string, code?: string) {
  socket.emit('operation-error', { message, code });
}

export function registerSocketHandlers(io: Server) {
  io.on('connection', async (socket: Socket) => {
    const authedSocket = socket as AuthedSocket;
    const user = authedSocket.user;
    try {
      await setUserOnline(user.id, socket.id);
      io.emit('user-online', { userId: user.id });
    } catch (onlineErr) {
      logger.error('Socket: Failed to set user online', onlineErr);
      emitSocketError(socket, 'Failed to set user online', 'USER_ONLINE_ERROR');
    }

    socket.on('private-message', async (payload: PrivateMessagePayload) => {
      try {
        const message = await createMessage(payload.senderId, payload.receiverId, payload.content);
        const receiver = await getUserById(payload.receiverId);
        if (receiver?.socketIds && receiver.socketIds.length > 0) {
          receiver.socketIds.forEach((sid: string) => io.to(sid).emit('private-message', message));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to send message', err);
        emitSocketError(socket, err?.message || 'Failed to send message', 'SEND_MESSAGE_ERROR');
      }
    });

    socket.on('message-seen', async (payload: MessageSeenPayload) => {
      try {
        const updated = await markMessageSeen(payload.messageId, payload.userId);
        if (updated) {
          const sender = await getUserById(updated.sender.toString());
          if (sender?.socketIds && sender.socketIds.length > 0) {
            sender.socketIds.forEach((sid: string) => io.to(sid).emit('message-seen', { messageId: updated._id }));
          }
        }
      } catch (err: any) {
        logger.error('Socket: Failed to mark message as seen', err);
        emitSocketError(socket, err?.message || 'Failed to mark message as seen', 'MESSAGE_SEEN_ERROR');
      }
    });

    // WebRTC signaling
    socket.on('call-user', async (payload: CallSignalPayload) => {
      try {
        const call = await createCall(payload.callerId, payload.calleeId);
        if (!call) throw new Error('Call creation failed');
        const callee = await getUserById(payload.calleeId);
        if (callee?.socketIds && callee.socketIds.length > 0) {
          callee.socketIds.forEach((sid: string) => io.to(sid).emit('call-user', { ...payload, callId: call._id }));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to initiate call', err);
        emitSocketError(socket, err?.message || 'Failed to initiate call', 'CALL_USER_ERROR');
      }
    });

    socket.on('answer-call', async (payload: CallSignalPayload & { callId: string }) => {
      try {
        const caller = await getUserById(payload.callerId);
        if (caller?.socketIds && caller.socketIds.length > 0) {
          caller.socketIds.forEach((sid: string) => io.to(sid).emit('answer-call', payload));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to answer call', err);
        emitSocketError(socket, err?.message || 'Failed to answer call', 'ANSWER_CALL_ERROR');
      }
    });

    socket.on('ice-candidate', async (payload: CallSignalPayload) => {
      try {
        const callee = await getUserById(payload.calleeId);
        if (callee?.socketIds && callee.socketIds.length > 0) {
          callee.socketIds.forEach((sid: string) => io.to(sid).emit('ice-candidate', payload));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to send ICE candidate', err);
        emitSocketError(socket, err?.message || 'Failed to send ICE candidate', 'ICE_CANDIDATE_ERROR');
      }
    });

    socket.on('end-call', async (payload: CallStatusPayload & { userId: string; peerId: string }) => {
      try {
        await updateCallStatus(payload.callId, payload.status);
        const peer = await getUserById(payload.peerId);
        if (peer?.socketIds && peer.socketIds.length > 0) {
          peer.socketIds.forEach((sid: string) => io.to(sid).emit('end-call', payload));
        }
      } catch (err: any) {
        logger.error('Socket: Failed to end call', err);
        emitSocketError(socket, err?.message || 'Failed to end call', 'END_CALL_ERROR');
      }
    });

    socket.on('disconnect', async () => {
      try {
        await setUserOffline(user.id, socket.id);
        const updatedUser = await getUserById(user.id);
        if (!updatedUser?.socketIds || updatedUser.socketIds.length === 0) {
          io.emit('user-offline', { userId: user.id });
        }
      } catch (offErr) {
        logger.error('Socket disconnect error:', offErr);
      }
    });
  });
}
