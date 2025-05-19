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
const message_service_1 = require("../services/message.service");
const Message_1 = __importDefault(require("../models/Message"));
const mongoose_1 = __importDefault(require("mongoose"));
describe('Message Service Edge Cases', () => {
    let userA, userB, message;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.MONGO_URI, { dbName: process.env.dbName });
        userA = new mongoose_1.default.Types.ObjectId();
        userB = new mongoose_1.default.Types.ObjectId();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Message_1.default.deleteMany({});
        yield mongoose_1.default.disconnect();
        yield mongoose_1.default.connection.close();
    }));
    it('should return null if marking seen for wrong user', () => __awaiter(void 0, void 0, void 0, function* () {
        const msg = yield (0, message_service_1.createMessage)(userA.toString(), userB.toString(), 'test');
        if (!msg)
            throw new Error('Failed to create message');
        const result = yield (0, message_service_1.markMessageSeen)(msg._id.toString(), userA.toString());
        expect(result).toBeNull();
    }));
    it('should throw if getMessagesBetweenUsers fails (invalid id)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, message_service_1.getMessagesBetweenUsers)('invalid', userB.toString())).rejects.toBeTruthy();
    }));
});
