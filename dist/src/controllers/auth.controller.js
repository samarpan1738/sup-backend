"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.logout = exports.signin = exports.signup = void 0;
const client_1 = __importDefault(require("../db/client"));
const authUtils_1 = require("../utils/authUtils");
const yup = __importStar(require("yup"));
const auth_1 = require("../utils/requestSchemas/auth");
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a user
        try {
            console.log("/api/auth/signup body : ", req.body);
            const validatedBody = yield auth_1.signupSchema.validate(req.body);
            console.log("validatedBody : ", validatedBody);
            const encryptedPassword = yield authUtils_1.encryptPassword(validatedBody.password);
            const user = yield client_1.default.user.create({
                data: Object.assign(Object.assign({}, validatedBody), { password: encryptedPassword }),
            });
            res.status(200).json({
                success: true,
                message: "User registered successfully",
                data: user,
            });
        }
        catch (e) {
            if (e instanceof yup.ValidationError) {
                console.log("Yup validation error");
                let errStr = "";
                for (let err of e.errors)
                    errStr += err + ". ";
                console.log("errStr: " + errStr);
                res.status(400).json({ success: false, message: errStr });
            }
        }
    });
}
exports.signup = signup;
function signin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Return a JWT token
        try {
            // console.log("/api/auth/login body : ", req.body);
            const validatedBody = yield auth_1.loginSchema.validate(req.body);
            // console.log("validatedBody : ", validatedBody);
            const user = yield client_1.default.user.findUnique({
                where: { username: validatedBody.username },
            });
            console.log("user : ", user);
            if (user == null) {
                return res.status(400).json({
                    success: false,
                    message: "Username doesn't exists. Try signup",
                    data: null,
                });
            }
            const validPassword = yield authUtils_1.comparePasswords(validatedBody.password, user.password);
            console.log("validPassword : ", validPassword);
            if (validPassword) {
                const token = authUtils_1.createToken({
                    id: user.id,
                    username: user.username,
                });
                console.log("token : ", token);
                // res.setHeader("Set-Cookie", [
                //     `token=${token}; Path=/; HttpOnly; SameSite=None; Secure=true;`,
                // ]);
                // * Set http only cookie
                // res.cookie("JWT", token, {
                //     httpOnly: true,
                //     secure:true,
                //     sameSite:true,
                //     expires: new Date(new Date().getTime() + 200 * 1000),
                // });
                res.status(200)
                    .cookie("JWT", token, {
                    sameSite: "strict",
                    path: "/",
                    expires: new Date(new Date().getTime() + 60 * 60 * 1000),
                    httpOnly: true,
                })
                    .json({
                    success: true,
                    message: "Login Successful!",
                    data: {
                        email: user.email,
                        name: user.name,
                        userId: user.id,
                        lastActive: user.last_active,
                        token,
                    },
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect password. Try again",
                    data: null,
                });
            }
        }
        catch (e) {
            if (e instanceof yup.ValidationError) {
                console.log("Yup validation error");
                let errStr = "";
                for (let err of e.errors)
                    errStr += err + ". ";
                console.log("errStr: " + errStr);
                res.status(400).json({ success: false, message: errStr });
            }
        }
    });
}
exports.signin = signin;
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Logout function");
        res.setHeader("Access-Control-Allow-Origin", "CORS");
        res.status(200).clearCookie("JWT").json({
            success: true,
            message: "Logged out successfully.",
        });
    });
}
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map