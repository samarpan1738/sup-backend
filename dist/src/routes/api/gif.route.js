"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const gif_controller_1 = require("../../controllers/gif.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
router.get("/trending", authMiddleware_1.requiresAuth, gif_controller_1.getTrendingGifs);
exports.default = router;
//# sourceMappingURL=gif.route.js.map