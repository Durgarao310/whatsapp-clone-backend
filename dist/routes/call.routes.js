"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const call_controller_1 = require("../controllers/call.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, (req, res) => (0, call_controller_1.getCallHistory)(req, res));
exports.default = router;
