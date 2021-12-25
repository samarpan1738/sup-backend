"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const corsConfig_1 = require("./config/corsConfig");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socketRequestSchema_1 = require("./utils/socketRequestSchema");
const conversation_controller_1 = require("./controllers/conversation.controller");
const app = express_1.default();
const server = require("http").createServer(app);
const socketServer = require("socket.io")(server, {
    cors: {
        origin: "https://localhost",
        methods: ["GET", "POST"],
    },
});
const PORT = process.env.PORT;
app.disable("x-powered-by");
app.use(cookie_parser_1.default());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cors_1.default(corsConfig_1.corsOptions));
app.use(express_1.default.static('public'));
app.use("/", require("./routes"));
socketServer.on("connection", (socket) => {
    console.log("New connection on socket server : ", socket.id);
    socket.on("sendToRoom", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedReq = yield socketRequestSchema_1.sendToRoom.validate(data);
            console.log(`[sendToRoom socket endpoint] data : `, validatedReq);
            const message = yield conversation_controller_1.addMessageToConversation(validatedReq);
            socketServer.to(validatedReq.roomId).emit("message", message);
        }
        catch (err) {
            console.log(err);
        }
    }));
    socket.on("joinRooms", (data) => {
        console.log(`[joinRooms socket endpoint] data : ${data}`);
        socket.join(data);
        socket.on("disconnect", () => {
            data.forEach(roomId => {
                console.log("Leaving room # ", roomId);
                socket.leave(roomId);
            });
        });
    });
    socket.emit("ping", "");
});
server.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map