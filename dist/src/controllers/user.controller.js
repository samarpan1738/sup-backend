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
exports.search = exports.addUser = exports.getUserById = exports.getUserByUsername = void 0;
const client_1 = __importDefault(require("../db/client"));
const yup = __importStar(require("yup"));
const errorUtils_1 = require("../utils/errorUtils");
function getUserByUsername(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield client_1.default.user.findUnique({
                where: {
                    username: req.params.username,
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    profile_pic_uri: true,
                },
            });
            if (user == null) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            else {
                res.status(200).json({
                    success: true,
                    message: "User found",
                    data: user,
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
exports.getUserByUsername = getUserByUsername;
function getUserById(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield client_1.default.user.findUnique({
                where: {
                    id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                },
            });
            if (user == null) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            else {
                res.status(200).json({
                    success: true,
                    message: "User found",
                    data: user,
                });
            }
        }
        catch (e) {
            errorUtils_1.handleError(e, res);
        }
    });
}
exports.getUserById = getUserById;
function addUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // 0.   Check if both users are already in a DM conversation
        // 1.   Create a conversation
        // 2.   Add req.user and username in the created conversation
        try {
            let userIdToAdd = parseInt(req.params.idd);
            const combinationId = `${Math.min(userIdToAdd, req.user.id)}${Math.max(userIdToAdd, req.user.id)}`;
            const buff = Buffer.from(combinationId, "utf-8");
            const combinationIdHash = buff.toString("base64");
            const existingConversation = yield client_1.default.conversation.findUnique({
                where: {
                    hash: combinationIdHash,
                },
            });
            if (existingConversation) {
                res.status(200).json({
                    success: true,
                    message: "Already added",
                });
            }
            else {
                const conversation = yield client_1.default.conversation.create({
                    data: {
                        hash: combinationIdHash,
                        users: {
                            createMany: {
                                data: [
                                    {
                                        user_id: req.user.id,
                                    },
                                    {
                                        user_id: userIdToAdd,
                                    },
                                ],
                            },
                        },
                        created_by_id: req.user.id
                    },
                });
                res.status(200).json({
                    success: true,
                    message: "Users added in conversation",
                    data: conversation,
                });
            }
        }
        catch (e) {
            errorUtils_1.handleError(e, res);
        }
    });
}
exports.addUser = addUser;
function search(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { query } = req.query;
            const users = yield client_1.default.user.findMany({
                where: {
                    AND: [
                        {
                            username: { contains: query === null || query === void 0 ? void 0 : query.toString() },
                        },
                        {
                            id: {
                                not: {
                                    equals: req.user.id
                                }
                            }
                        }
                    ]
                },
                select: {
                    email: true,
                    id: true,
                    last_active: true,
                    name: true,
                    profile_pic_uri: true,
                    username: true,
                },
            });
            res.status(200).json({
                success: true,
                data: users,
            });
        }
        catch (e) {
            errorUtils_1.handleError(e, res);
        }
    });
}
exports.search = search;
//# sourceMappingURL=user.controller.js.map