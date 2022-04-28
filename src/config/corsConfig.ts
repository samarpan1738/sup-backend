import { CorsOptions } from "cors";
const corsOrigin: any =
    process.env.NODE_ENV === "development" ? process.env.CORS_ORIGIN_DEV : process.env.CORS_ORIGIN_PROD;
export const corsOptions: CorsOptions = {
    origin: corsOrigin,
    credentials: true,
};
