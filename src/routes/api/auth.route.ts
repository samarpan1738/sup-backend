const router = require("express").Router();
import { logout, signin, signup } from "../../controllers/auth.controller";
import { requiresAuth } from "../../middlewares/authMiddleware";

router.post("/signup", signup);
router.post("/login", signin);
router.get("/logout",requiresAuth,logout);

export default router;
