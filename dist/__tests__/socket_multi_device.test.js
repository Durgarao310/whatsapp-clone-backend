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
const supertest_1 = __importDefault(require("supertest"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const index_1 = __importDefault(require("../index"));
const PORT = 5002;
let io;
let httpServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    httpServer = (0, http_1.createServer)(index_1.default);
    io = new socket_io_1.Server(httpServer);
    httpServer.listen(PORT);
    yield mongoose_1.default.connect(process.env.MONGO_URI, { dbName: process.env.dbName });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
    io.close();
    httpServer.close();
}));
describe('Socket multi-device support (integration)', () => {
    let user;
    let token;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.default.deleteMany({ username: 'socketuser' });
        const res = yield (0, supertest_1.default)(index_1.default).post('/api/auth/register').send({ username: 'socketuser', password: 'password123' });
        token = res.body.token;
        user = res.body.user;
    }));
    it('should add multiple socketIds for a user', (done) => {
        const client1 = (0, socket_io_client_1.default)(`http://localhost:${PORT}`, { auth: { token } });
        const client2 = (0, socket_io_client_1.default)(`http://localhost:${PORT}`, { auth: { token } });
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const dbUser = yield User_1.default.findById(user.id);
            expect((_a = dbUser === null || dbUser === void 0 ? void 0 : dbUser.socketIds) === null || _a === void 0 ? void 0 : _a.length).toBeGreaterThanOrEqual(2);
            client1.close();
            client2.close();
            done();
        }), 1000);
    });
    it('should remove socketId on disconnect and set online false if none left', (done) => {
        const client = (0, socket_io_client_1.default)(`http://localhost:${PORT}`, { auth: { token } });
        client.on('connect', () => __awaiter(void 0, void 0, void 0, function* () {
            client.close();
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const dbUser = yield User_1.default.findById(user.id);
                expect((_a = dbUser === null || dbUser === void 0 ? void 0 : dbUser.socketIds) === null || _a === void 0 ? void 0 : _a.length).toBe(0);
                expect(dbUser === null || dbUser === void 0 ? void 0 : dbUser.online).toBe(false);
                done();
            }), 1000);
        }));
    });
});
