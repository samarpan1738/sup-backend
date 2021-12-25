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
exports.deleteAllMessagesForUser = exports.markMessageReadForUser = exports.addMessageToConversation = exports.createConversation = exports.getConversationMessages = exports.getConversationsForUser = void 0;
const client_1 = __importDefault(require("../db/client"));
const errorUtils_1 = require("../utils/errorUtils");
const conversation_1 = require("../utils/requestSchemas/conversation");
function getConversationsForUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conversations = yield client_1.default.conversation.findMany({
                where: {
                    users: {
                        some: {
                            user_id: req.user.id,
                        },
                    },
                },
                select: {
                    users: {
                        select: {
                            user: {
                                select: {
                                    name: true,
                                    id: true,
                                    username: true,
                                    last_active: true,
                                    profile_pic_uri: true,
                                    status: true,
                                },
                            },
                        },
                    },
                    messagesForUser: {
                        where: {
                            user_id: req.user.id,
                        },
                        select: {
                            message: {
                                include: {
                                    sender: true,
                                },
                            },
                            read: true,
                        },
                        orderBy: {
                            message: {
                                createdAt: "asc",
                            },
                        },
                        // take:1
                    },
                    type: true,
                    title: true,
                    hash: true,
                    id: true,
                    description: true,
                    createdBy: {
                        select: {
                            id: true,
                        },
                    },
                    createdAt: true,
                    conversationIconUrl: true,
                },
            });
            res.status(200).json({
                success: true,
                data: conversations,
            });
        }
        catch (err) {
            errorUtils_1.handleError(err, res);
        }
    });
}
exports.getConversationsForUser = getConversationsForUser;
function getConversationMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Conversation id : ", req.params.id);
            const messages = yield client_1.default.conversationMessagesForUser.findMany({
                where: {
                    user_id: req.user.id,
                    conversation_id: parseInt(req.params.id),
                },
                select: {
                    message: true,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });
            res.status(200).json({
                success: true,
                data: messages,
            });
        }
        catch (err) {
            errorUtils_1.handleError(err, res);
        }
    });
}
exports.getConversationMessages = getConversationMessages;
function createConversation(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
        1.  Create conversation
        2.  Add users to conversation
        */
        try {
            const data = {};
            let conversationUsers = req.body.users.map((uid) => parseInt(uid));
            if (req.body.type === conversation_1.CONVERSATION_TYPE.CONTACT) {
                let userIdToAdd = conversationUsers[0];
                const combinationId = `${Math.min(userIdToAdd, req.user.id)}${Math.max(userIdToAdd, req.user.id)}`;
                const buff = Buffer.from(combinationId, "utf-8");
                const combinationIdHash = buff.toString("base64");
                data.hash = combinationIdHash;
                data.type = conversation_1.CONVERSATION_TYPE.CONTACT;
            }
            else {
                data.type = conversation_1.CONVERSATION_TYPE.GROUP;
                data.title = req.body.title;
                data.description = req.body.description;
            }
            data.created_by_id = req.user.id;
            data.conversationIconUrl = "https://avatars.dicebear.com/api/identicon/seed.svg";
            const conversation = yield client_1.default.conversation.create({
                data,
            });
            conversationUsers.push(req.user.id);
            console.log("conversationUsers : ", conversationUsers);
            yield client_1.default.usersInConversation.createMany({
                data: conversationUsers.map((uid) => {
                    return { conversation_id: conversation.id, user_id: uid };
                }),
            });
            res.status(201).json({
                success: true,
                message: "User successfully added",
                data: null,
            });
        }
        catch (err) {
            if (err.code && err.code === "P2002")
                res.status(400).json({
                    success: false,
                    message: "Already added",
                    data: null,
                });
            else
                errorUtils_1.handleError(err, res);
        }
    });
}
exports.createConversation = createConversation;
function addMessageToConversation(data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("addMessageToConversation -> data : ", data);
        try {
            const message = yield client_1.default.message.create({
                data: {
                    conversation_id: parseInt(data.roomId),
                    sender_id: parseInt(data.sender),
                    text: data.type === "TEXT" ? data.content : null,
                    file_uri: data.type === "IMAGE" ? data.content : null,
                    type: data.type,
                },
                include: {
                    sender: true,
                },
            });
            const usersInConversation = yield client_1.default.usersInConversation.findMany({
                where: {
                    conversation_id: parseInt(data.roomId),
                },
            });
            const queryData = [];
            usersInConversation.forEach((user) => {
                queryData.push({
                    conversation_id: message.conversation_id,
                    message_id: message.id,
                    user_id: user.user_id,
                    read: user.user_id === parseInt(data.sender),
                });
            });
            console.log("queryData : ", queryData);
            yield client_1.default.conversationMessagesForUser.createMany({
                data: queryData,
            });
            return message;
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.addMessageToConversation = addMessageToConversation;
function markMessageReadForUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // conversation_id,user_id,[message_id]
        try {
            yield client_1.default.conversationMessagesForUser.updateMany({
                data: {
                    read: true,
                },
                where: {
                    conversation_id: parseInt(req.params.id),
                    user_id: req.user.id,
                    message_id: {
                        in: req.body.messageIds,
                    },
                },
            });
            res.status(200).json({
                success: true,
                message: "Messages marked as read",
                data: null,
            });
        }
        catch (error) {
            errorUtils_1.handleError(error, res);
        }
    });
}
exports.markMessageReadForUser = markMessageReadForUser;
function deleteAllMessagesForUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client_1.default.conversationMessagesForUser.deleteMany({
                where: {
                    conversation_id: parseInt(req.params.id),
                    user_id: req.user.id,
                },
            });
            res.status(200).json({
                success: true,
                message: "Successfully deleted all messages",
                data: null,
            });
        }
        catch (error) {
            errorUtils_1.handleError(error, res);
        }
    });
}
exports.deleteAllMessagesForUser = deleteAllMessagesForUser;
//# sourceMappingURL=conversation.controller.js.map