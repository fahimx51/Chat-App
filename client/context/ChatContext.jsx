import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    // Pull the active socket from AuthContext
    const { socket, authUser } = useContext(AuthContext);

    // 1. Fetch all users for the sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/user");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages || {});
            }
        } catch (error) {
            toast.error("Could not load users");
            console.error(error.message);
        }
    };

    // 2. Fetch chat history with a specific user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
                setUnseenMessages((prev) => ({ ...prev, [userId]: 0 }));

                // --- ADD THIS LINE ---
                // Tell the sender that you just opened the chat and saw everything
                socket.emit("message-seen-instant", {
                    senderId: userId, // The other person
                    receiverId: authUser._id // You
                });
            }
        } catch (error) {
            toast.error(error.message || "Could not load messages");
        }
    };

    // 3. Send message (Updates your screen immediately)
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                // Add the message you just sent to your own chat window
                setMessages((prev) => [...prev, data.message]);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send");
        }
    };

    // 4. REAL-TIME LISTENERS
    useEffect(() => {
        if (!socket) return;

        // Listener for Incoming Messages
        socket.on("new-message", (newMessage) => {
            const isFromActiveChat = selectedUser?._id === newMessage.senderId;

            if (isFromActiveChat) {
                // 1. Add to messages list locally with seen: true
                setMessages((prev) => [...prev, { ...newMessage, seen: true }]);

                // 2. Update the Database
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => { });

                // 3. THE FIX: Shout to the sender that you saw it right now!
                socket.emit("message-seen-instant", {
                    senderId: newMessage.senderId, // The person who sent the msg
                    receiverId: newMessage.receiverId // You
                });
            } else {
                // Increment badge for other users
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
            }
        });

        // --- NEW: Listener for Seen Status ---
        socket.on("messages-seen", ({ seenBy }) => {
            // If the person I'm currently looking at saw my messages
            if (selectedUser && seenBy === selectedUser._id) {
                setMessages((prev) =>
                    prev.map((msg) => ({ ...msg, seen: true }))
                );
            }
        });

        // CLEANUP
        return () => {
            socket.off("new-message");
            socket.off("messages-seen");
        };
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        setMessages,
        setSelectedUser,
        setUnseenMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};