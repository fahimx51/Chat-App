import { Message } from "../models/Message";
import { User } from "../models/User";

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

