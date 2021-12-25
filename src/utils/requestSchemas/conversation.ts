import { AuthRequest } from "../../types";

export enum CONVERSATION_TYPE {
    GROUP = "GROUP",
    CONTACT = "CONTACT",
}

export interface CreateConversationRequest extends AuthRequest {
    body: {
        users: string[];
        type: CONVERSATION_TYPE;
        title:string;
        description:string;
    };
}
