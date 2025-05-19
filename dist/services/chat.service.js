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
exports.getChatThreads = getChatThreads;
const Message_1 = __importDefault(require("../models/Message"));
const index_1 = require("../index");
/**
 * Returns all chat threads for a user, each with the other user's info and the latest message.
 * @param userId The authenticated user's ID
 */
function getChatThreads(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Aggregate to get the latest message per chat (between userId and each other user)
        try {
            const threads = yield Message_1.default.aggregate([
                {
                    $match: {
                        $or: [
                            { sender: userId },
                            { receiver: userId }
                        ]
                    }
                },
                {
                    $addFields: {
                        otherUser: {
                            $cond: [
                                { $eq: ['$sender', userId] },
                                '$receiver',
                                '$sender'
                            ]
                        }
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $group: {
                        _id: '$otherUser',
                        latestMessage: { $first: '$$ROOT' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        user: {
                            id: '$user._id',
                            username: '$user.username',
                            online: '$user.online',
                            socketIds: '$user.socketIds'
                        },
                        latestMessage: {
                            id: '$latestMessage._id',
                            sender: '$latestMessage.sender',
                            receiver: '$latestMessage.receiver',
                            content: '$latestMessage.content',
                            seen: '$latestMessage.seen',
                            createdAt: '$latestMessage.createdAt'
                        }
                    }
                },
                { $sort: { 'latestMessage.createdAt': -1 } }
            ]);
            return threads;
        }
        catch (err) {
            index_1.logger.error('Error in getChatThreads', err);
            throw err;
        }
    });
}
