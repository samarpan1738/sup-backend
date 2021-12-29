const router = require("express").Router();
import {getUserByUsername,getUserById,search,updateUser} from "../../controllers/user.controller";
const { requiresAuth } = require("../../middlewares/authMiddleware");

router.get("/",requiresAuth,getUserById)
router.get("/search",requiresAuth,search)
router.get("/:username",requiresAuth,getUserByUsername)
router.patch("/:username",requiresAuth,updateUser)

export default router;