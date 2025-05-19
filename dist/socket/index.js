"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const socketAuth_middleware_1 = require("../middlewares/socketAuth.middleware");
const handlers_1 = require("./handlers");
function registerSocketHandlers(io) {
    io.use(socketAuth_middleware_1.socketAuthMiddleware);
    (0, handlers_1.registerSocketHandlers)(io);
}
