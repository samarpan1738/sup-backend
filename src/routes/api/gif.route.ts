const router = require("express").Router();
import { getTrendingGifs,  } from "../../controllers/gif.controller";
import { requiresAuth } from "../../middlewares/authMiddleware";

router.get("/trending", requiresAuth, getTrendingGifs);

export default router;
