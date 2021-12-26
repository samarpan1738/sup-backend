/*
1.  User creates account
2.  User joins a conversation (Can be both 1:1 and 1:n)
3.  Add a version of all older messages for the newly joined user
4.  User fetches messages for the conversation
5.  User sends message in the conversation
6.  User sees a message in the conversation
7.  User deletes a message in the conversation
	- A message whose sender was the user     -> Delete for all or Delete for the user
	- A message whose sender was not the user -> Just Delete for the user
*/
import express, { Express } from "express";
import { Server } from "http";
import cors from "cors";
import { corsOptions } from "./config/corsConfig";
import cookieParser from "cookie-parser";
import { Socket } from "socket.io";
import {sendToRoom} from "./utils/socketRequestSchema"
import { addMessageToConversation } from "./controllers/conversation.controller";
const app: Express = express();
const server: Server = require("http").createServer(app);
const socketServer: any = require("socket.io")(server, {
    cors: {
        origin: "https://sup-gg.netlify.app/",
        methods: ["GET", "POST"],
    },
});
const PORT: String|undefined = process.env.PORT;
app.disable("x-powered-by");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(express.static('public'))

app.use("/", require("./routes"));

socketServer.on("connection", (socket: Socket) => {
    console.log("New connection on socket server : ", socket.id);
    socket.on("sendToRoom",async (data)=>{
        try
        {
            const validatedReq = await sendToRoom.validate(data);
            console.log(`[sendToRoom socket endpoint] data : `,validatedReq)
            const message=await addMessageToConversation(validatedReq);
            socketServer.to(validatedReq.roomId).emit("message",message)
        }
        catch(err)
        {
            console.log(err)
        }
    })
    socket.on("joinRooms",(data:string[])=>{
        console.log(`[joinRooms socket endpoint] data : ${data}`)
        socket.join(data);
        socket.on("disconnect",()=>{
            data.forEach(roomId => {
                console.log("Leaving room # ",roomId)
                socket.leave(roomId);
            });
        })
    })
    socket.emit("ping","")
});

server.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
