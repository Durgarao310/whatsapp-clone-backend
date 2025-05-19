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
const user_service_1 = require("../services/user.service");
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
describe('User Service Edge Cases', () => {
    let user;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.MONGO_URI, { dbName: process.env.dbName });
        user = yield User_1.default.create({ username: 'edgeuser', password: 'pw', online: false });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.default.deleteMany({ username: 'edgeuser' });
        yield mongoose_1.default.disconnect();
    }));
    it('should handle setUserOffline for user with no socketIds', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, user_service_1.setUserOffline)(user._id, 'nonexistent');
        expect(result).toBeTruthy();
    }));
    it('should return null for getUserById with invalid id', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, user_service_1.getUserById)('invalid')).rejects.toBeTruthy();
    }));
    it('should return null for getUserBySocketId with no match', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, user_service_1.getUserBySocketId)('notfound');
        expect(result).toBeNull();
    }));
});
