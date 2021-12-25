const router = require("express").Router();
import {} from "../../controllers/message.controller";
const { requiresAuth } = require("../../middlewares/authMiddleware");

router.get("/",requiresAuth,()=>{})

export default router;