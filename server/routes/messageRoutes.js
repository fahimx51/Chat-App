import express from "express";
import { getAllUsers, getMessages, markMessagesAsSeen, sendMessage } from "../controllers/messageController";
import { protectRoute } from "../middleware/auth";

const messageRouter = express.Router();

messageRouter.get('/user', protectRoute, getAllUsers);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark/:id', protectRoute, markMessagesAsSeen);
messageRouter.post('/send/:id', protectRoute, sendMessage);

export default messageRouter;