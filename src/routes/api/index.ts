import {Router} from "express"
const router:Router = require("express").Router();
import authRoute from "./auth.route";
import userRoute from "./user.route";
import messageRoute from "./message.route";
import conversationsRoute from "./conversation.route";
import gifRoute from "./gif.route";
router.use("/user",userRoute);
router.use("/auth",authRoute);
router.use("/message",messageRoute);
router.use("/conversations",conversationsRoute);
router.use("/gif",gifRoute);

export default router;
