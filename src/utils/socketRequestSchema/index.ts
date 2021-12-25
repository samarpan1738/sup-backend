import * as yup from "yup";

export const sendToRoom = yup.object().shape({
    roomId: yup.string().required(),
    sender: yup.string().required(),
    content: yup.string().required(),
});
