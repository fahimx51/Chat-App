
//middleware to protect routes
export const protectRoute = (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.json({ success: false, messege: "Unauthorized Access" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.json({ success: false, messege: "User not found" });
        }

        req.user = user;

        next();
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, messege: error.message });
    }
}