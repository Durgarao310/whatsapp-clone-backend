"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesQueryValidation = void 0;
// filepath: src/validation/messageValidation.ts
const express_validator_1 = require("express-validator");
exports.getMessagesQueryValidation = [
    (0, express_validator_1.query)('withUserId').isString().notEmpty().withMessage('withUserId is required'),
];
