import prisma from "../db/client";
import { Request, Response } from "express";

import { comparePasswords, encryptPassword, createToken } from "../utils/authUtils";
import * as yup from "yup";
import db from "../db/drizzle-client";
import { signupSchema, loginSchema } from "../utils/requestSchemas/auth";
import {Prisma } from "@prisma/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
const corsOrigin: any =
    process.env.NODE_ENV === "development" ? process.env.CORS_ORIGIN_DEV : process.env.CORS_ORIGIN_PROD;

type PrismClientErrorMeta = {
    target: string[];
};
const DEFAULT_STATUS = "Hey there! I'm using Sup";
export async function signup(req: Request, res: Response) {
    try {
        const validatedBody = await signupSchema.validate(req.body);
        const encryptedPassword = await encryptPassword(validatedBody.password);
        const user = await db.insert(users).values({
            username:validatedBody.username,
            email:validatedBody.email,
            name:validatedBody.name,
            password:encryptedPassword,
            lastActiveAt:validatedBody.last_active,
            profilePicUri:validatedBody.profile_pic_uri,
            status:DEFAULT_STATUS
        }).returning();

        res.status(200).json({
            success: true,
            message: "User registered successfully",
            data: user[0],
        });
    } catch (e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError) {
            let errorMessage = "Error saving user"
            if( e.code === "P2002" && (e.meta as PrismClientErrorMeta).target.includes("username")) {
                errorMessage = `Username already exists`;
            }
            return res.status(400).json({
                success: false,
                message: errorMessage});
        }
        if (e instanceof yup.ValidationError) {
            console.log("Yup validation error");
            let errStr = "";
            for (let err of e.errors) errStr += err + ". ";
            console.log("errStr: " + errStr);
            return res.status(400).json({ success: false, message: errStr });
        }
        res.status(500).json({ success: false, message: e?.message });
    }
}

export async function signin(req: Request, res: Response) {
    // Return a JWT token
    try {
        const validatedBody = await loginSchema.validate(req.body);
        const usersArr = await db.select().from(users).where(eq(users.username,validatedBody.username)).limit(1);
        if (usersArr == null || usersArr.length == 0) {
            return res.status(400).json({
                success: false,
                message: "User not found. Try signup",
                data: null,
            });
        }
        const user = usersArr[0];
        const validPassword = await comparePasswords(validatedBody.password, user.password);
        if (validPassword) {
            const token = createToken({
                id: user.id,
                username: user.username,
            });
            return res.status(200)
                .cookie("JWT", token, {
                    // sameSite: "strict",
                    path: "/",
                    expires: new Date(new Date().getTime() + 60 * 60 * 1000),
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                })
                .json({
                    success: true,
                    message: "Login Successful!",
                    data: {
                        email: user.email,
                        name: user.name,
                        userId: user.id,
                        lastActive: user.lastActiveAt,
                        profile_pic_uri: user.profilePicUri,
                        username: user.username,
                        status: user.status,
                    },
                });
        } else {
            return res.status(400).json({
                success: false,
                message: "Incorrect password. Try again",
                data: null,
            });
        }
    } catch (e:any) {
        if (e instanceof yup.ValidationError) {
            console.log("Yup validation error" , e.message);
            let errStr = "";
            for (let err of e.errors) errStr += err + ". ";
            console.log("errStr: " + errStr);
            return res.status(400).json({ success: false, message: errStr });
        }
        return res.status(500).json({ success: false, message: e.message });
    }
}

export async function logout(req: Request, res: Response) {
    console.log("Logout function");
    res.setHeader("Access-Control-Allow-Origin", corsOrigin);
    res.status(200)
        .clearCookie("JWT", {
            path: "/",
            httpOnly: true,
            sameSite: "none",
            secure: true,
        })
        .json({
            success: true,
            message: "Logged out successfully.",
        });
}
