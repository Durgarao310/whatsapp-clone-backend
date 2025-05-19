"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.registerValidation = void 0;
// filepath: src/validation/authValidation.ts
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)('username').isString().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    (0, express_validator_1.body)('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
exports.loginValidation = [
    (0, express_validator_1.body)('username').isString().notEmpty().withMessage('Username is required'),
    (0, express_validator_1.body)('password').isString().notEmpty().withMessage('Password is required'),
];
