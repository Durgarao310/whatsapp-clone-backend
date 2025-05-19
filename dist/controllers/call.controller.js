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
exports.getCallHistory = getCallHistory;
const Call_1 = __importDefault(require("../models/Call"));
const http_status_1 = __importDefault(require("http-status"));
const index_1 = require("../index");
function getCallHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const calls = yield Call_1.default.find({
                $or: [
                    { caller: userId },
                    { callee: userId },
                ],
            }).sort({ startedAt: -1 });
            res.json(calls.map(call => ({
                id: call._id,
                caller: call.caller,
                callee: call.callee,
                status: call.status,
                startedAt: call.startedAt,
                endedAt: call.endedAt
            })));
        }
        catch (err) {
            index_1.logger.error('Failed to fetch call history', err);
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch call history', error: err instanceof Error ? err.message : err });
        }
    });
}
