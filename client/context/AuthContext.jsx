import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    //check if user is authenticated and if so, set user data and initialize socket connection

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        }
        catch (error) {
            console.error("Error checking authentication:", error.message);
            toast.error(error.message);
        }
    }

    //login function to set token and user data, and connect to socket server

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                // 1. Save to Storage
                localStorage.setItem("token", data.token);
                setToken(data.token);

                // 2. IMPORTANT: Update Axios Header IMMEDIATELY
                axios.defaults.headers.common["token"] = data.token;

                // 3. Update User State
                setAuthUser(data.userData); // Make sure you use data.userData to match your backend

                // 4. Connect Socket
                connectSocket(data.userData);

                toast.success(data.messege);

                // 5. Navigate
                navigate("/");
            } else {
                toast.error(data.messege);
            }
        } catch (error) {
            toast.error(error.response?.data?.messege || "An error occurred");
        }
    };


    //logout function to clear token, user data, and disconnect from socket server

    const logout = async () => {
        setToken(null);
        localStorage.removeItem("token");
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully");
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }

    //update profile function to update user data and show success message

    const updateProfile = async (updatedData) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", updatedData);
            console.log(data);
            if (data.success) {
                setAuthUser(data.user);
                toast.success(data.messege);
            }
            else {
                toast.error(data.messege);
            }
        }
        catch (error) {
            toast.error(error.messege);
        }
    };

    //connect to socket server and listen for online users updates
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }

        checkAuth();

    }, []);


    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}