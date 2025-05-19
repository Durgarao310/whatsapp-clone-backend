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
exports.setUserOnline = setUserOnline;
exports.setUserOffline = setUserOffline;
exports.getUserById = getUserById;
exports.getUserBySocketId = getUserBySocketId;
const User_1 = __importDefault(require("../models/User"));
const asyncatch_1 = require("../helpers/asyncatch");
const document_1 = require("../helpers/document");
const index_1 = require("../index");
function setUserOnline(userId, socketId) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * Adds a socketId to the user's socketIds array and sets them online.
         * @param userId - The user's ID
         * @param socketId - The socket connection ID
         * @returns The updated user document or null
         */
        // Add socketId to the array if not present
        const [user, err] = yield (0, asyncatch_1.asyncatch)(User_1.default.findByIdAndUpdate(userId, { online: true, $addToSet: { socketIds: socketId } }, { new: true }));
        if (err) {
            index_1.logger.error('Error in setUserOnline', err);
            throw err;
        }
        return user;
    });
}
function setUserOffline(userId, socketId) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * Removes a socketId from the user's socketIds array. If no socketIds remain, sets the user offline.
         * @param userId - The user's ID
         * @param socketId - The socket connection ID to remove
         * @returns The updated user document or null
         */
        // Remove socketId from the array; if none left, set online to false
        const [user, err] = yield (0, asyncatch_1.asyncatch)(User_1.default.findByIdAndUpdate(userId, { $pull: { socketIds: socketId } }, { new: true }));
        if (err) {
            index_1.logger.error('Error in setUserOffline', err);
            throw err;
        }
        if (user && user.socketIds && user.socketIds.length === 0) {
            user.online = false;
            const [saved, saveErr] = yield (0, document_1.saveDoc)(user);
            if (saveErr) {
                index_1.logger.error('Error saving user in setUserOffline', saveErr);
                throw saveErr;
            }
            return saved;
        }
        return user;
    });
}
function getUserById(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * Retrieves a user by their ID.
         * @param userId - The user's ID
         * @returns The user document or null
         */
        const [user, err] = yield (0, asyncatch_1.asyncatch)(User_1.default.findById(userId).exec());
        if (err) {
            index_1.logger.error('Error in getUserById', err);
            throw err;
        }
        return user;
    });
}
function getUserBySocketId(socketId) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * Retrieves a user by a socketId.
         * @param socketId - The socket connection ID
         * @returns The user document or null
         */
        const [user, err] = yield (0, asyncatch_1.asyncatch)(User_1.default.findOne({ socketIds: socketId }).exec());
        if (err) {
            index_1.logger.error('Error in getUserBySocketId', err);
            throw err;
        }
        return user;
    });
}
