import { NextFunction, Request, Response } from "express";
import { TokenUser } from "../utils/authUtils";
import jwt from "jsonwebtoken";
import prisma from "../db/client";
import { AuthRequest } from "../types";

export async function requiresAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    // const authHeader = req.headers["authorization"];
    // console.log("authHeader : ", authHeader);
    // console.log("req.cookies : ",req.cookies.JWT);
    // const token = authHeader && authHeader.split(" ")[1];
    const token = req.cookies.JWT;
    console.log("token : ", token);
    try {
        if(!token) {
            throw new Error("Authentication required");
        }
        
        const decodedUser = <TokenUser>(
            jwt.verify(token, process.env.JWT_SECRET!)
        );

        if (!decodedUser) {
            return res.status(403).json({
                success: false,
                message: "Token is invalid.",
            });
        }
        console.log("decodedUser : ", decodedUser);
        const user = await prisma.user.findUnique({
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
    } catch (error: any) {
        console.log(error.stack);
        res.status(401).json({
            success: false,
            message: "You are not authorized to access this resource",
            data: null,
        });
    }
}