import { Response } from "express";
export function handleError(e: any, res: Response) {
    console.log(e.stack);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}