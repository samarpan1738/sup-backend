import prisma from "../db/client";
import { Response } from "express";
import { AuthRequest } from "../types";
import { handleError } from "../utils/errorUtils";
import axios from "axios";
const {TENOR_API_KEY}=process.env;
console.log("TENOR_API_KEY : ",TENOR_API_KEY)
export async function getTrendingGifs(req: AuthRequest, res: Response) {
    try {
        const limit=req.query.limit !== undefined ? req.query.limit : "10";
        const data=await axios.get(`https://g.tenor.com/v1/trending?key=${TENOR_API_KEY}&limit=${limit}`);
        console.log("data : ",data.data)
        res.status(200).json({
            success: true,
            data:data.data
        });
    } catch (err: any) {
        handleError(err, res);
    }
}
