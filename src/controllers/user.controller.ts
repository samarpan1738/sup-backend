import prisma from "../db/client"
import { Request, Response } from "express";
import * as yup from "yup";
import { AuthRequest } from "../types";
import { handleError } from "../utils/errorUtils";

export async function getUserByUsername(
    req: AuthRequest,
    res: Response
): Promise<any> {
    try {
        const user = await prisma.user.findUnique({
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
        } else {
            res.status(200).json({
                success: true,
                message: "User found",
                data: user,
            });
        }
    } catch (e) {
        if (e instanceof yup.ValidationError) {
            console.log("Yup validation error");
            let errStr = "";
            for (let err of e.errors) errStr += err + ". ";
            console.log("errStr: " + errStr);
            res.status(400).json({ success: false, message: errStr });
        }
    }
}

export async function getUserById(req: AuthRequest, res: Response) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user?.id,
            },
        });
        if (user == null) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        } else {
            res.status(200).json({
                success: true,
                message: "User found",
                data: user,
            });
        }
    } catch (e) {
        handleError(e, res);
    }
}

export async function addUser(req: AuthRequest, res: Response) {
    // 0.   Check if both users are already in a DM conversation
    // 1.   Create a conversation
    // 2.   Add req.user and username in the created conversation
    try {
        let userIdToAdd: number = parseInt(req.params.idd);
        const combinationId = `${Math.min(userIdToAdd, req.user.id)}${Math.max(
            userIdToAdd,
            req.user.id
        )}`;
        const buff = Buffer.from(combinationId, "utf-8");
        const combinationIdHash = buff.toString("base64");
        const existingConversation = await prisma.conversation.findUnique({
            where: {
                hash: combinationIdHash,
            },
        });
        if (existingConversation) {
            res.status(200).json({
                success: true,
                message: "Already added",
            });
        } else {
            const conversation = await prisma.conversation.create({
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
                    created_by_id:req.user.id
                },
            });
            res.status(200).json({
                success: true,
                message: "Users added in conversation",
                data: conversation,
            });
        }
    } catch (e: any) {
        handleError(e, res);
    }
}

export async function search(req: AuthRequest, res: Response) {
    try {
        let { query } = req.query;
        const users = await prisma.user.findMany({
            where: {
                AND:[
                {
                    username: { contains: query?.toString() },
                },
                {
                    id:{
                        not:{
                            equals:req.user.id
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
    } catch (e) {
        handleError(e, res);
    }
}