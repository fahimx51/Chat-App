import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs"

//controller for user signup
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, messege: "Missing user details" });
        }

        const user = await User.findOne({ email });

        if (user) return res.json({ success: false, messege: "User already exist" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id);

        return res.json({ success: true, userData: newUser, token, messege: "Account created successfully" });
    }
    catch (error) {
        console.log(error.message);
        return res.json({ success: false, messege: error.message });
    }
};

//controller for user login
export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    try {
        if (!email || !password) {
            return res.json({ success: false, messege: "Missing user details" });
        }

        const userData = await User.findOne({ email });

        if (!userData) {
            return res.json({ success: false, messege: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!isPasswordCorrect) {
            return res.json({ success: false, messege: "Invalid credentials" });
        }

        const token = generateToken(userData._id);

        res.json({ success: true, userData, token, messege: "Login successful" });

    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, messege: error.message });
    }
}

//Controller to check if user is authenticated
export const checkAuth = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ success: false, messege: "Unauthorized Access" });
        }

        res.json({ success: true, user: req.user, messege: "User is authenticated" });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, messege: error.message });
    }
}

//Controller to update user profile
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName, bio } = req.body;
        const userId = req.user._id;

        let updatedUser;

        if (!profilePic || profilePic === "") {
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true });
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio, profilePic: upload.secure_url }, { new: true });
        }

        res.json({ success: true, user: updatedUser, messege: "Profile updated successfully" });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, messege: error.message });
    }
} 