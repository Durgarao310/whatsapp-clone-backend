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
exports.getMessages = getMessages;
const express_validator_1 = require("express-validator");
const http_status_1 = __importDefault(require("http-status"));
const index_1 = require("../index");
const message_service_1 = require("../services/message.service");
function getMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(http_status_1.default.BAD_REQUEST).json({ message: 'Validation error', errors: errors.array() });
            return;
        }
        try {
            const userId = req.user.id;
            const { withUserId } = req.query;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const result = yield (0, message_service_1.getMessagesBetweenUsers)(userId, withUserId, { limit, page });
            const messages = (_a = result === null || result === void 0 ? void 0 : result.messages) !== null && _a !== void 0 ? _a : [];
            const total = (_b = result === null || result === void 0 ? void 0 : result.total) !== null && _b !== void 0 ? _b : 0;
            res.json({
                messages: messages.map(msg => ({
                    id: msg._id,
                    sender: msg.sender,
                    receiver: msg.receiver,
                    content: msg.content,
                    seen: msg.seen,
                    createdAt: msg.createdAt
                })),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrevious: page > 1
                }
            });
        }
        catch (err) {
            index_1.logger.error('Failed to fetch messages', err);
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch messages', error: err instanceof Error ? err.message : err });
        }
    });
}
