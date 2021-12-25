import * as yup from "yup";

export const signupSchema = yup.object().shape({
    name: yup.string().required(),
    email: yup.string().email().required(),
    username: yup.string().required(),
    password: yup.string().required().min(8),
    profile_pic_uri: yup
        .string()
        .url()
        .default("https://avatars.dicebear.com/api/human/john.svg"),
    last_active: yup.date().default(function () {
        return new Date();
    }),
});
export const loginSchema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required().min(8),
});
