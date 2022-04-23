const dbUrl: any =
    process.env.NODE_ENV === "development" ? process.env.DATABASE_URL_DEV : process.env.DATABASE_URL_PROD;
export const corsOptions:CorsOptions = {
    origin:corsOrigin ,
    credentials: true,
};
