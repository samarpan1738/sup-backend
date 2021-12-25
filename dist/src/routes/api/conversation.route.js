"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const conversation_controller_1 = require("../../controllers/conversation.controller");
const { requiresAuth } = require("../../middlewares/authMiddleware");
router.get("/", requiresAuth, conversation_controller_1.getConversationsForUser);
router.post("/", requiresAuth, conversation_controller_1.createConversation);
router.get("/:id/messages", requiresAuth, conversation_controller_1.getConversationMessages);
router.delete("/:id/messages", requiresAuth, conversation_controller_1.deleteAllMessagesForUser);
router.post("/:id/messages/markRead", requiresAuth, conversation_controller_1.markMessageReadForUser);
exports.default = router;
//# sourceMappingURL=conversation.route.js.map