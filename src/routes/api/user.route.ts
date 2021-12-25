const router = require("express").Router();
import {getUserByUsername,getUserById,addUser,search} from "../../controllers/user.controller";
const { requiresAuth } = require("../../middlewares/authMiddleware");

router.get("/",requiresAuth,getUserById)
router.get("/search",requiresAuth,search)
router.get("/:username",requiresAuth,getUserByUsername)
router.get("/:idd/add",requiresAuth,addUser)

export default router;