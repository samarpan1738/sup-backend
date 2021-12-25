"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const api_1 = __importDefault(require("./api"));
router.use("/api", api_1.default);
module.exports = router;
//# sourceMappingURL=index.js.map