import express from "express";
import { getAllUsers, getMessages, markMessagesAsSeen, sendMessage } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const messageRouter = express.Router();

messageRouter.get('/user', protectRoute, getAllUsers);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark/:id', protectRoute, markMessagesAsSeen);
messageRouter.post('/send/:id', protectRoute, sendMessage);

export default messageRouter;