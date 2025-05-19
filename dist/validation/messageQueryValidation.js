"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withUserIdQueryValidation = void 0;
// filepath: src/validation/messageQueryValidation.ts
const express_validator_1 = require("express-validator");
exports.withUserIdQueryValidation = [
    (0, express_validator_1.query)('withUserId').isString().notEmpty().withMessage('withUserId is required'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit must be an integer between 1 and 100'),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page must be an integer greater than 0'),
];
