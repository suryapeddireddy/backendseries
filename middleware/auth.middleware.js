import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const verifyJWT = async (req, res, next) => {
    console.log("JWT verification middleware triggered");  // Debugging line
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log("Decoded Token: ", decoded);
        
        if (!decoded.id) {
            return res.status(401).json({ message: "Access denied, invalid" });
        }

        const user = await User.findById(decoded.id).select("-password");
        
        if (!user) {
            return res.status(401).json({ message: "Access denied, user not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in JWT verification:", error);
        return res.status(401).json({ message: "Invalid token or session expired" });
    }
};
