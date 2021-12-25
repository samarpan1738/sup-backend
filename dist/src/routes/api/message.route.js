"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const { requiresAuth } = require("../../middlewares/authMiddleware");
router.get("/", requiresAuth, () => { });
exports.default = router;
//# sourceMappingURL=message.route.js.map