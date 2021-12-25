"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const user_controller_1 = require("../../controllers/user.controller");
const { requiresAuth } = require("../../middlewares/authMiddleware");
router.get("/", requiresAuth, user_controller_1.getUserById);
router.get("/search", requiresAuth, user_controller_1.search);
router.get("/:username", requiresAuth, user_controller_1.getUserByUsername);
router.get("/:idd/add", requiresAuth, user_controller_1.addUser);
exports.default = router;
//# sourceMappingURL=user.route.js.map