import {User} from "@prisma/client";
import { Request } from "express";

export interface ApiResponse {
    success: boolean;
    message: string;
}

export interface AuthRequest extends Request {
    user: User;
}
