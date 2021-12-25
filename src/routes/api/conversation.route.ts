const router = require("express").Router();
import { getConversationsForUser ,getConversationMessages,createConversation, deleteAllMessagesForUser, markMessageReadForUser} from "../../controllers/conversation.controller";
const { requiresAuth } = require("../../middlewares/authMiddleware");

router.get("/", requiresAuth, getConversationsForUser);
router.post("/", requiresAuth, createConversation);
router.get("/:id/messages", requiresAuth, getConversationMessages);
router.delete("/:id/messages", requiresAuth, deleteAllMessagesForUser);
router.post("/:id/messages/markRead", requiresAuth, markMessageReadForUser);

export default router;
