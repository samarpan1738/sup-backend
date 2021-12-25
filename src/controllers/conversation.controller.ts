import prisma from "../db/client";
import { Response } from "express";
import { AuthRequest } from "../types/index";
import { handleError } from "../utils/errorUtils";
import { CreateConversationRequest, CONVERSATION_TYPE } from "../utils/requestSchemas/conversation";

export async function getConversationsForUser(req: AuthRequest, res: Response) {
    try {
        const conversations = await prisma.conversation.findMany({
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
    } catch (err: any) {
        handleError(err, res);
    }
}

export async function getConversationMessages(req: AuthRequest, res: Response) {
    try {
        console.log("Conversation id : ", req.params.id);
        const messages = await prisma.conversationMessagesForUser.findMany({
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
    } catch (err: any) {
        handleError(err, res);
    }
}

export async function createConversation(req: CreateConversationRequest, res: Response) {
    /*
    1.  Create conversation
    2.  Add users to conversation
    */
    try {
        const data: any = {};

        let conversationUsers: number[] = req.body.users.map((uid) => parseInt(uid));
        if (req.body.type === CONVERSATION_TYPE.CONTACT) {
            let userIdToAdd: number = conversationUsers[0];
            const combinationId = `${Math.min(userIdToAdd, req.user.id)}${Math.max(userIdToAdd, req.user.id)}`;
            const buff = Buffer.from(combinationId, "utf-8");
            const combinationIdHash = buff.toString("base64");
            data.hash = combinationIdHash;
            data.type = CONVERSATION_TYPE.CONTACT;
        } else {
            data.type = CONVERSATION_TYPE.GROUP;
            data.title = req.body.title;
            data.description = req.body.description;
        }
        data.created_by_id = req.user.id;
        data.conversationIconUrl="https://avatars.dicebear.com/api/identicon/seed.svg";
        const conversation = await prisma.conversation.create({
            data,
        });
        conversationUsers.push(req.user.id);
        console.log("conversationUsers : ", conversationUsers);
        await prisma.usersInConversation.createMany({
            data: conversationUsers.map((uid) => {
                return { conversation_id: conversation.id, user_id: uid };
            }),
        });

        res.status(201).json({
            success: true,
            message: "User successfully added",
            data: null,
        });
    } catch (err: any) {
        if (err.code && err.code === "P2002")
            res.status(400).json({
                success: false,
                message: "Already added",
                data: null,
            });
        else handleError(err, res);
    }
}

export async function addMessageToConversation(data: any) {
    console.log("addMessageToConversation -> data : ", data);
    try {
        const message = await prisma.message.create({
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
        const usersInConversation = await prisma.usersInConversation.findMany({
            where: {
                conversation_id: parseInt(data.roomId),
            },
        });
        const queryData: any = [];
        usersInConversation.forEach((user:any) => {
            queryData.push({
                conversation_id: message.conversation_id,
                message_id: message.id,
                user_id: user.user_id,
                read: user.user_id === parseInt(data.sender),
            });
        });
        console.log("queryData : ", queryData);
        await prisma.conversationMessagesForUser.createMany({
            data: queryData,
        });
        return message;
    } catch (error) {
        console.log(error);
    }
}

export async function markMessageReadForUser(req: AuthRequest, res: Response) {
    // conversation_id,user_id,[message_id]
    try {
        await prisma.conversationMessagesForUser.updateMany({
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
    } catch (error) {
        handleError(error, res);
    }
}

export async function deleteAllMessagesForUser(req: AuthRequest, res: Response) {
    try {
        await prisma.conversationMessagesForUser.deleteMany({
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
    } catch (error) {
        handleError(error, res);
    }
}
