import prisma from "../db/client"
import { Request, Response } from "express";

import {
    comparePasswords,
    encryptPassword,
    createToken,
} from "../utils/authUtils";
import * as yup from "yup";

import { signupSchema, loginSchema } from "../utils/requestSchemas/auth";

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
        if (e instanceof yup.ValidationError) {
            console.log("Yup validation error");
            let errStr = "";
            for (let err of e.errors) errStr += err + ". ";
            console.log("errStr: " + errStr);
            res.status(400).json({ success: false, message: errStr });
        }
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
        const validPassword = await comparePasswords(
            validatedBody.password,
            user.password
        );
        console.log("validPassword : ", validPassword);
        if (validPassword) {
            const token = createToken({
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
        } else {
            return res.status(400).json({
                success: false,
                message: "Incorrect password. Try again",
                data: null,
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

export async function logout(req: Request, res: Response) {
    console.log("Logout function");
    res.setHeader("Access-Control-Allow-Origin", "CORS");
    res.status(200).clearCookie("JWT").json({
        success: true,
        message: "Logged out successfully.",
    });
}
