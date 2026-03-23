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

        const user = User.findOne({ email });

        if (user) res.json({ success: false, messege: "User already exist" });

        const hashedPassword = bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id);

        res.json({ success: true, userData: newUser, token, messege: "Account created successfully" });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, messege: error.message });
    }
};

//controller for user login
export const login = async (req, res) => {
    const { email, password } = req.body;

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