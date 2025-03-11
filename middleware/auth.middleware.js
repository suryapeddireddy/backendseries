import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const verifyJWT = async (req, res, next) => {   
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Ensure that the token contains _id
        if (!decoded || !decoded._id) {
            return res.status(401).json({ message: "Access denied" });
        }

        const user = await User.findById(decoded._id).select("-password");

        // If the user doesn't exist, access is denied
        if (!user) {
            return res.status(401).json({ message: "Access denied" });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
