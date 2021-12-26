import { CorsOptions } from "cors";
const whitelist = ["http://localhost:3000", "https://sup-gg.netlify.app"];

export const corsOptions:CorsOptions = {
    origin: function (origin: any, callback: any) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
