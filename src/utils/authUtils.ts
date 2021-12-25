import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function encryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}
export async function comparePasswords(
    p1: string,
    p2: string
): Promise<boolean> {
    return await bcrypt.compare(p1, p2);
}
export interface TokenUser extends JwtPayload {
    id: number;
    username: string;
}
export function createToken(user: TokenUser): string {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            iss: "api.sup.com",
            aud: "app.sup.com",
        },
        process.env.JWT_SECRET as string,
        {
            // algorithm: 'HS256',
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
    );
}
