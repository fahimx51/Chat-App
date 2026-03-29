import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//create express app
const app = express();
const server = http.createServer(app);

//Initilize socket.io server
export const io = new Server(server, {
    cors: {
        origin: "*", // Replace with your React app's URL
        credentials: true
    }
});

//Store online users
export const userSocketMap = new Map();


//Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`User connected: ${userId}`);

    if (userId) {
        userSocketMap.set(userId, socket.id);
    }

    //Emit online users to all clients
    io.emit("online-users", Array.from(userSocketMap.keys()));

    socket.on("message-seen-instant", ({ senderId, receiverId }) => {
        // Find the original sender's socket
        const senderSocketId = userSocketMap.get(senderId);
        if (senderSocketId) {
            // Tell them that the receiver (receiverId) saw the message
            io.to(senderSocketId).emit("messages-seen", { seenBy: receiverId });
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId}`);
        userSocketMap.delete(userId);
        io.emit("online-users", Array.from(userSocketMap.keys()));
    });

});

//middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors({
    origin: "*", // Replace with your React app's URL
    credentials: true
}));

//Routes setup
app.use("/api/status", (req, res) => {
    res.send("<h1>Server is live!</h1>");
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// connect DB
await connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running at port : ${PORT}`);
});