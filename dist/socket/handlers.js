"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const message_service_1 = require("../services/message.service");
const user_service_1 = require("../services/user.service");
const call_service_1 = require("../services/call.service");
const asyncatch_1 = require("../helpers/asyncatch");
const index_1 = require("../index");
function registerSocketHandlers(io) {
    io.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
        const authedSocket = socket;
        const user = authedSocket.user;
        const [onlineUser, onlineErr] = yield (0, asyncatch_1.asyncatch)((0, user_service_1.setUserOnline)(user.id, socket.id));
        if (onlineErr) {
            socket.emit('error', { message: 'Failed to set user online' });
        }
        else if (user) {
            io.emit('user-online', { userId: user.id });
        }
        socket.on('private-message', (payload) => __awaiter(this, void 0, void 0, function* () {
            const [message, msgErr] = yield (0, asyncatch_1.asyncatch)((0, message_service_1.createMessage)(payload.senderId, payload.receiverId, payload.content));
            if (msgErr)
                return socket.emit('error', { message: 'Failed to send message' });
            const [receiver, recvErr] = yield (0, asyncatch_1.asyncatch)((0, user_service_1.getUserById)(payload.receiverId));
            if (!recvErr && (receiver === null || receiver === void 0 ? void 0 : receiver.socketIds) && receiver.socketIds.length > 0) {
                receiver.socketIds.forEach((sid) => io.to(sid).emit('private-message', message));
            }
        }));
        socket.on('message-seen', (payload) => __awaiter(this, void 0, void 0, function* () {
            const [updated, seenErr] = yield (0, asyncatch_1.asyncatch)((0, message_service_1.markMessageSeen)(payload.messageId, payload.userId));
            if (seenErr)
                return socket.emit('error', { message: 'Failed to mark message as seen' });
            if (updated) {
                const [sender, senderErr] = yield (0, asyncatch_1.asyncatch)((0, user_service_1.getUserById)(updated.sender.toString()));
                if (!senderErr && (sender === null || sender === void 0 ? void 0 : sender.socketIds) && sender.socketIds.length > 0) {
                    sender.socketIds.forEach((sid) => io.to(sid).emit('message-seen', { messageId: updated._id }));
                }
            }
        }));
        // WebRTC signaling
        socket.on('call-user', (payload) => __awaiter(this, void 0, void 0, function* () {
            const [call, callErr] = yield (0, asyncatch_1.asyncatch)((0, call_service_1.createCall)(payload.callerId, payload.calleeId));
            if (callErr || !call)
                return socket.emit('error', { message: 'Failed to initiate call' });
            const [callee, calleeErr] = yield (0, asyncatch_1.asyncatch)((0, user_service_1.getUserById)(payload.calleeId));
            if (!calleeErr && (callee === null || callee === void 0 ? void 0 : callee.socketIds) && callee.socketIds.length > 0) {
                callee.socketIds.forEach((sid) => io.to(sid).emit('call-user', Object.assign(Object.assign({}, payload), { callId: call._id })));
            }
        }));
        socket.on('answer-call', (payload) => __awaiter(this, void 0, void 0, function* () {
            const [caller, callerErr] = yield (0, asyncatch_1.asyncatch)((0, user_service_1.getUserById)(payload.callerId));
            if (callerErr)
                return socket.emit('error', { message: 'Failed to answer call' });
            if ((caller === null || caller === void 0 ? void 0 : caller.socketIds) && caller.socketIds.length > 0) {
                caller.socketIds.forEach((sid) => io.to(sid).emit('answer-call', payload));
            }
        }));
        socket.on('ice-candidate', (payload) => __awaiter(this, void 0, void 0, function* () {
            const [callee, calleeErr] = yield (0, asyncatch_1.asyncatch)((0, user_service_1.getUserById)(payload.calleeId));
            if (calleeErr)
                return socket.emit('error', { message: 'Failed to send ICE candidate' });
            if ((callee === null || callee === void 0 ? void 0 : callee.socketIds) && callee.socketIds.length > 0) {
                callee.socketIds.forEach((sid) => io.to(sid).emit('ice-candidate', payload));
            }
        }));
        socket.on('end-call', (payload) => __awaiter(this, void 0, void 0, function* () {
            const [_, endErr] = yield (0, asyncatch_1.asyncatch)((0, call_service_1.updateCallStatus)(payload.callId, payload.status));
            if (endErr)
                return socket.emit('error', { message: 'Failed to end call' });
            const [peer, peerErr] = yield (0, asyncatch_1.asyncatch)((0, user_service_1.getUserById)(payload.peerId));
            if (!peerErr && (peer === null || peer === void 0 ? void 0 : peer.socketIds) && peer.socketIds.length > 0) {
                peer.socketIds.forEach((sid) => io.to(sid).emit('end-call', payload));
            }
        }));
        socket.on('disconnect', () => __awaiter(this, void 0, void 0, function* () {
            const [_, offErr] = yield (0, asyncatch_1.asyncatch)((0, user_service_1.setUserOffline)(user.id, socket.id));
            if (!offErr && user) {
                const [updatedUser] = yield (0, asyncatch_1.asyncatch)((0, user_service_1.getUserById)(user.id));
                if (!(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.socketIds) || updatedUser.socketIds.length === 0) {
                    io.emit('user-offline', { userId: user.id });
                }
            }
            else if (offErr && process.env.NODE_ENV === 'development') {
                index_1.logger.error('Socket disconnect error:', offErr);
            }
        }));
    }));
    // Note: For production, restrict CORS origins in Socket.IO setup.
    // TODO: Support multiple socket IDs per user for multi-device/multi-tab scenarios.
    // Current implementation only supports a single socketId per user.
}
