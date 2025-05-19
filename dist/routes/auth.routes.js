"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const authValidation_1 = require("../validation/authValidation");
const validation_1 = require("../helpers/validation");
const router = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { message: 'Too many requests, please try again later.' },
});
router.post('/register', authLimiter, authValidation_1.registerValidation, function (req, res, next) { (0, validation_1.handleValidation)(req, res, next); }, auth_controller_1.register);
router.post('/login', authLimiter, authValidation_1.loginValidation, function (req, res, next) { (0, validation_1.handleValidation)(req, res, next); }, auth_controller_1.login);
exports.default = router;
