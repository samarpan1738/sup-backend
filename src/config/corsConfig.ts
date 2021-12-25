import { CorsOptions } from "cors";
const whitelist = ["https://localhost", "https://sup-gg.herokuapp.com"];

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
