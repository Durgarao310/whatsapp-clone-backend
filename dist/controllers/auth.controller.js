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
exports.register = register;
exports.login = login;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../helpers/jwt");
const express_validator_1 = require("express-validator");
const http_status_1 = __importDefault(require("http-status"));
const index_1 = require("../index");
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(http_status_1.default.BAD_REQUEST).json({ message: 'Validation error', errors: errors.array() });
            return;
        }
        try {
            const { username, password } = req.body;
            const existing = yield User_1.default.findOne({ username });
            if (existing) {
                res.status(http_status_1.default.BAD_REQUEST).json({ message: 'Username taken' });
                return;
            }
            const hashed = yield bcryptjs_1.default.hash(password, 10);
            const user = yield User_1.default.create({ username, password: hashed });
            const token = (0, jwt_1.generateToken)(user);
            res.json({
                token,
                user: {
                    id: user._id,
                    username: user.username
                }
            });
        }
        catch (err) {
            index_1.logger.error('Registration failed', err);
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: 'Registration failed', error: err instanceof Error ? err.message : err });
        }
    });
}
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(http_status_1.default.BAD_REQUEST).json({ message: 'Validation error', errors: errors.array() });
            return;
        }
        try {
            const { username, password } = req.body;
            const user = yield User_1.default.findOne({ username });
            if (!user) {
                res.status(http_status_1.default.BAD_REQUEST).json({ message: 'Invalid credentials' });
                return;
            }
            const match = yield bcryptjs_1.default.compare(password, user.password);
            if (!match) {
                res.status(http_status_1.default.BAD_REQUEST).json({ message: 'Invalid credentials' });
                return;
            }
            const token = (0, jwt_1.generateToken)(user);
            res.json({
                token,
                user: {
                    id: user._id,
                    username: user.username
                }
            });
        }
        catch (err) {
            index_1.logger.error('Login failed', err);
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: 'Login failed', error: err instanceof Error ? err.message : err });
        }
    });
}
