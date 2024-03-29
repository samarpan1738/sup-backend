import prisma from "../db/client";
import { Request, Response } from "express";

import { comparePasswords, encryptPassword, createToken } from "../utils/authUtils";
import * as yup from "yup";

import { signupSchema, loginSchema } from "../utils/requestSchemas/auth";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime";
const corsOrigin: any =
    process.env.NODE_ENV === "development" ? process.env.CORS_ORIGIN_DEV : process.env.CORS_ORIGIN_PROD;

type PrismClientErrorMeta = {
    target: string[];
};

export async function signup(req: Request, res: Response) {
    // Create a user
    try {
        console.log("/api/auth/signup body : ", req.body);
        const validatedBody = await signupSchema.validate(req.body);
        console.log("validatedBody : ", validatedBody);

        const encryptedPassword = await encryptPassword(validatedBody.password);

        const user = await prisma.user.create({
            data: { ...validatedBody, password: encryptedPassword },
        });
        res.status(200).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (e) {
        if(e instanceof PrismaClientKnownRequestError) {
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
        // console.log("/api/auth/login body : ", req.body);
        const validatedBody = await loginSchema.validate(req.body);
        // console.log("validatedBody : ", validatedBody);
        const user = await prisma.user.findUnique({
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
        const validPassword = await comparePasswords(validatedBody.password, user.password);
        console.log("validPassword : ", validPassword);
        if (validPassword) {
            const token = createToken({
                id: user.id,
                username: user.username,
            });
            console.log("Setting token: ", token);
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
                        lastActive: user.last_active,
                        profile_pic_uri: user.profile_pic_uri,
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
