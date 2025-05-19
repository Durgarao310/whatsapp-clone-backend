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
exports.createCall = createCall;
exports.updateCallStatus = updateCallStatus;
exports.getOngoingCallBetweenUsers = getOngoingCallBetweenUsers;
const Call_1 = __importDefault(require("../models/Call"));
const asyncatch_1 = require("../helpers/asyncatch");
const document_1 = require("../helpers/document");
const index_1 = require("../index");
function createCall(callerId, calleeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const [call, err] = yield (0, asyncatch_1.asyncatch)(Call_1.default.create({ caller: callerId, callee: calleeId, status: 'ongoing' }));
        if (err) {
            index_1.logger.error('Error in createCall', err);
            throw err;
        }
        return call;
    });
}
function updateCallStatus(callId, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const [call, findErr] = yield (0, asyncatch_1.asyncatch)(Call_1.default.findById(callId));
        if (findErr) {
            index_1.logger.error('Error in updateCallStatus (find)', findErr);
            throw findErr;
        }
        if (call) {
            call.status = status;
            if (status !== 'ongoing') {
                call.endedAt = new Date();
            }
            const [saved, saveErr] = yield (0, document_1.saveDoc)(call);
            if (saveErr) {
                index_1.logger.error('Error in updateCallStatus (save)', saveErr);
                throw saveErr;
            }
            return saved;
        }
        return null;
    });
}
function getOngoingCallBetweenUsers(userA, userB) {
    return __awaiter(this, void 0, void 0, function* () {
        const [call, err] = yield (0, asyncatch_1.asyncatch)(Call_1.default.findOne({
            $or: [
                { caller: userA, callee: userB, status: 'ongoing' },
                { caller: userB, callee: userA, status: 'ongoing' },
            ],
        }));
        if (err) {
            index_1.logger.error('Error in getOngoingCallBetweenUsers', err);
            throw err;
        }
        return call;
    });
}
