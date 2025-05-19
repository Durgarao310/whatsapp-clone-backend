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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = createMessage;
exports.markMessageSeen = markMessageSeen;
exports.getMessagesBetweenUsers = getMessagesBetweenUsers;
const Message_1 = __importDefault(require("../models/Message"));
const asyncatch_1 = require("../helpers/asyncatch");
const document_1 = require("../helpers/document");
const index_1 = require("../index");
function createMessage(senderId, receiverId, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const [message, err] = yield (0, asyncatch_1.asyncatch)(Message_1.default.create({ sender: senderId, receiver: receiverId, content }));
        if (err) {
            index_1.logger.error('Error in createMessage', err);
            throw err;
        }
        return message;
    });
}
function markMessageSeen(messageId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const [message, findErr] = yield (0, asyncatch_1.asyncatch)(Message_1.default.findById(messageId));
        if (findErr) {
            index_1.logger.error('Error in markMessageSeen (find)', findErr);
            throw findErr;
        }
        if (message && message.receiver.toString() === userId) {
            message.seen = true;
            const [saved, saveErr] = yield (0, document_1.saveDoc)(message);
            if (saveErr) {
                index_1.logger.error('Error in markMessageSeen (save)', saveErr);
                throw saveErr;
            }
            return saved;
        }
        return null;
    });
}
function getMessagesBetweenUsers(userA, userB, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // Pagination: limit (default 20), page (default 1)
        const limit = (_a = options === null || options === void 0 ? void 0 : options.limit) !== null && _a !== void 0 ? _a : 20;
        const page = (_b = options === null || options === void 0 ? void 0 : options.page) !== null && _b !== void 0 ? _b : 1;
        const skip = (page - 1) * limit;
        const [messages, err] = yield (0, asyncatch_1.asyncatch)(Message_1.default.find({
            $or: [
                { sender: userA, receiver: userB },
                { sender: userB, receiver: userA },
            ],
        })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit));
        if (err) {
            index_1.logger.error('Error in getMessagesBetweenUsers', err);
            throw err;
        }
        // Also return total count for pagination metadata
        const [total, countErr] = yield (0, asyncatch_1.asyncatch)(Message_1.default.countDocuments({
            $or: [
                { sender: userA, receiver: userB },
                { sender: userB, receiver: userA },
            ],
        }));
        if (countErr) {
            index_1.logger.error('Error in getMessagesBetweenUsers (count)', countErr);
            throw countErr;
        }
        return { messages, total };
    });
}
