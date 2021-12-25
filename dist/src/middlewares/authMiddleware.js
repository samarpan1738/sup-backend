"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiresAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../db/client"));
function requiresAuth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // const authHeader = req.headers["authorization"];
        // console.log("authHeader : ", authHeader);
        // console.log("req.cookies : ",req.cookies.JWT);
        // const token = authHeader && authHeader.split(" ")[1];
        const token = req.cookies.JWT;
        console.log("token : ", token);
        try {
            if (!token) {
                throw new Error("Authentication required");
            }
            const decodedUser = (jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET));
            if (!decodedUser) {
                return res.status(403).json({
                    success: false,
                    message: "Token is invalid.",
                });
            }
            console.log("decodedUser : ", decodedUser);
            const user = yield client_1.default.user.findUnique({
                where: {
                    id: decodedUser.id,
                },
            });
            console.log("user : ", user);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Token is invalid.",
                    data: null,
                });
            }
            req.user = user;
            next();
        }
        catch (error) {
            console.log(error.stack);
            res.status(401).json({
                success: false,
                message: "You are not authorized to access this resource",
                data: null,
            });
        }
    });
}
exports.requiresAuth = requiresAuth;
//# sourceMappingURL=authMiddleware.js.map