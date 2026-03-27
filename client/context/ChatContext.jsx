import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({}); // { userId: count }


    const { socket, axios } = useContext(AuthContext);


    //Function to get all user data for the sidebar
    const getUsers = async () => {
        console.log("Fetching users...");
        try {
            const { data } = await axios.get("/api/messages/user");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
                console.log(data.users);
            }
        }
        catch (error) {
            toast.error(error.message);
        }
    };

    //function to get messages of selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
                //reset unseen messages count for this user
                setUnseenMessages(prev => ({ ...prev, [userId]: 0 }));
            }
        }
        catch (error) {
            toast.error(error.messege);
        }
    };


    //function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prev) => [...prev, data.message]);
            }
            else {
                toast.error(data.messege);
            }
        }
        catch (error) {
            toast.error(error.messege);
        }
    };

    //function to subscribe to new messages from socket server

    const subscribeToMessages = () => {
        if (!socket) return;

        socket.on("newMessage", (message) => {
            if (selectedUser && message.senderId === selectedUser._id) {
                message.seen = true;
                setMessages((prev) => [...prev, message]);
                axios.put(`/api/messages/mark/${message._id}`);
            }
            else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [message.senderId]: prev[message.senderId] ? prev[message.senderId] + 1 : 1
                }));
            }
        });
    };

    //function to unsubscribe from messages when user logs out or changes
    const unsubscribeFromMessages = () => {
        if (socket) {
            socket.off("newMessage");
        }
    };


    useEffect(() => {
        subscribeToMessages();
        
        return () => {
            unsubscribeFromMessages();
        };
    }, [socket, selectedUser]);


    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessage, unseenMessages, setMessages, setSelectedUser, setUnseenMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
};