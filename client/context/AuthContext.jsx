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

    // --- AXIOS FIX ---
    // Instead of setting defaults once, we update them whenever the token changes.
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        } else {
            delete axios.defaults.headers.common["token"];
        }
    }, [token]);

    // --- SOCKET LOGIC ---
    // This effect handles the connection automatically when authUser exists.
    useEffect(() => {
        if (authUser) {
            const newSocket = io(backendUrl, {
                query: { userId: authUser._id },
            });

            setSocket(newSocket);

            newSocket.on("online-users", (userIds) => {
                setOnlineUsers(userIds);
            });

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        }
    }, [authUser]);

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
            }
        } catch (error) {
            console.error("CheckAuth Error:", error.message);
            setAuthUser(null);
        }
    };

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                localStorage.setItem("token", data.token);
                setToken(data.token); // This triggers the Axios useEffect
                setAuthUser(data.userData);

                toast.success(data.messege || "Login Successful");
                navigate("/");
            } else {
                toast.error(data.messege);
            }
        } catch (error) {
            toast.error(error.response?.data?.messege || "An error occurred");
        }
    };

    const logout = async () => {
        setToken(null);
        localStorage.removeItem("token");
        setAuthUser(null);
        setOnlineUsers([]);
        toast.success("Logged out successfully");
    };

    const updateProfile = async (updatedData) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", updatedData);
            if (data.success) {
                setAuthUser(data.user);
                toast.success(data.messege);
            }
        } catch (error) {
            toast.error(error.response?.data?.messege || "Update failed");
        }
    };

    // Run checkAuth once when the app loads
    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};