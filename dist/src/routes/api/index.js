"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const auth_route_1 = __importDefault(require("./auth.route"));
const user_route_1 = __importDefault(require("./user.route"));
const message_route_1 = __importDefault(require("./message.route"));
const conversation_route_1 = __importDefault(require("./conversation.route"));
const gif_route_1 = __importDefault(require("./gif.route"));
router.use("/user", user_route_1.default);
router.use("/auth", auth_route_1.default);
router.use("/message", message_route_1.default);
router.use("/conversations", conversation_route_1.default);
router.use("/gif", gif_route_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map