"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidation = handleValidation;
// filepath: src/helpers/validation.ts
const express_validator_1 = require("express-validator");
const http_status_1 = __importDefault(require("http-status"));
function handleValidation(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(http_status_1.default.BAD_REQUEST).json({ message: 'Validation error', errors: errors.array() });
    }
    next();
}
