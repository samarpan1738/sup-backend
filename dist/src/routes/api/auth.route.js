"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const auth_controller_1 = require("../../controllers/auth.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
router.post("/signup", auth_controller_1.signup);
router.post("/login", auth_controller_1.signin);
router.get("/logout", authMiddleware_1.requiresAuth, auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.route.js.map