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

export async function updateUser(req: AuthRequest, res: Response) {
    if(req.user.username !== req.params.username){
        return res.status(403).json({
            success: false,
            data:null,
            message:"Not authorized"
        })
    }
    const data:any={};
    if(req.body.status !== undefined || req.body.status !== null){
        data.status=req.body.status;
        await prisma.user.update({
            where:{
                id:req.user.id
            },
            data:{
                status:req.body.status
    
            }
        })
        return res.status(204).json({
            success:true,
            data:null,
            message:"Status updated successfully"
        })
    }
    res.status(400).json({
        success:false,
        data:null,
        message:"Bad Request"
    })
}