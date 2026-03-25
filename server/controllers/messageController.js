import { Message } from "../models/Message";
import { User } from "../models/User";
import cloudinary from "../utils/cloudinary.js";
import { io, userSocketMap } from "../server.js";

//Get all users expect the logged in user
export const getAllUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const users = await User.find({ _id: { $ne: userId } }).select("-password");

        //count the number of unseen messages from each user
        const unseenMessages = {};
        const promises = users.map(async (user) => {
            const count = await Message.countDocuments({ senderId: user._id, receiverId: userId, seen: false });
            if (count > 0) {
                unseenMessages[user._id] = count;
            }
        });

        await Promise.all(promises);

        res.json({ success: true, users, unseenMessages });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, messege: error.message });
    }
};

// Get all messages from selected user 
export const getMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: selectedUserId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        await Message.updateMany({ senderId: selectedUserId, receiverId: userId, seen: false }, { $set: { seen: true } });

        res.json({ success: true, messages });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, messege: error.message });
    }
};

//Api to mark messages as seen when user opens the chat
export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { $set: { seen: true } });
        res.json({ success: true, messege: "Message marked as seen" });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, messege: error.message });
    }
};

//Send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const receiverId = req.params.id;
        const { text, image } = req.body;

        let imageUrl;

        if (image) {
            const upload = await cloudinary.uploader.upload(image);
            imageUrl = upload.secure_url;
        }

        const message = new Message({
            senderId: req.user._id,
            receiverId: receiverId,
            text,
            image: imageUrl
        });

        await message.save();

        //Emit the message to receiver's socket if online
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("new-message", message);
        }

        res.json({ success: true, message });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
