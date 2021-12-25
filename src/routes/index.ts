import { Router } from "express";

const router:Router = require("express").Router();
import apiIndexRouter from "./api"
router.use("/api", apiIndexRouter);

module.exports = router;
