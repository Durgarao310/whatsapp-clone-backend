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
const index_1 = __importDefault(require("../index"));
// Helper to register and login a user, returns { token, user }
function registerAndLogin(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.default).post('/api/auth/register').send({ username, password });
        const res = yield (0, supertest_1.default)(index_1.default).post('/api/auth/login').send({ username, password });
        return res.body;
    });
}
describe('Message API', () => {
    let userA, userB;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        userA = yield registerAndLogin('userA', 'password123');
        userB = yield registerAndLogin('userB', 'password123');
    }));
    it('should return 400 if withUserId is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/messages')
            .set('Authorization', `Bearer ${userA.token}`);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
    }));
    it('should return 200 and an array for valid request', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/messages')
            .set('Authorization', `Bearer ${userA.token}`)
            .query({ withUserId: userB.user.id });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    }));
    it('should return paginated messages and metadata', () => __awaiter(void 0, void 0, void 0, function* () {
        // Send 25 messages from userA to userB
        for (let i = 0; i < 25; i++) {
            yield (0, supertest_1.default)(index_1.default)
                .post('/api/messages')
                .set('Authorization', `Bearer ${userA.token}`)
                .send({ receiverId: userB.user.id, content: `msg${i}` });
        }
        // Request page 2 with limit 10
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/messages')
            .set('Authorization', `Bearer ${userA.token}`)
            .query({ withUserId: userB.user.id, limit: 10, page: 2 });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('messages');
        expect(res.body).toHaveProperty('pagination');
        expect(Array.isArray(res.body.messages)).toBe(true);
        expect(res.body.messages.length).toBe(10);
        expect(res.body.pagination).toMatchObject({ page: 2, limit: 10 });
        expect(res.body.pagination.total).toBeGreaterThanOrEqual(25);
        expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(3);
    }));
});
describe('Call API', () => {
    let userA, userB;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        userA = yield registerAndLogin('userA2', 'password123');
        userB = yield registerAndLogin('userB2', 'password123');
    }));
    it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default).get('/api/calls');
        expect(res.status).toBe(401);
    }));
    it('should return 200 and an array for authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/calls')
            .set('Authorization', `Bearer ${userA.token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    }));
});
