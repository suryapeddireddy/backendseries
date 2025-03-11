import express from "express";
import asynchandler from "../utils/asynchandler.js";
import User from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = asynchandler(async (req, res) => {
    const { email, password, fullname, username } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !fullname || !username) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(409).json({ message: "Email or username already exists" });
    }

    // Check if avatar and cover image files are uploaded
    if (!req.files || !req.files.avatar || !req.files.coverImage) {
        return res.status(400).json({ message: "Avatar and Cover Image are required" });
    }

    // Upload to Cloudinary
    const avatarUrl = await uploadOnCloudinary(req.files.avatar[0].path);
    const coverImageUrl = await uploadOnCloudinary(req.files.coverImage[0].path);

    if (!avatarUrl || !coverImageUrl) {
        return res.status(500).json({ message: "File upload failed" });
    }

    // Create new user
    const newUser = new User({
        email,
        password,
        fullname,
        username,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
    });

    await newUser.save();
    const createdUser = await User.findById(newUser._id).select("-password");
    return res.status(201).json({ message: "User registered successfully", user: createdUser });
});

const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const loginUser = asynchandler(async (req, res) => {
    try {
        const { email, username, password } = req.body;
    
        // Find user and explicitly select password field
        const user = await User.findOne({ $or: [{ email }, { username }] }).select("+password");
    
        if (!user) {
          return res.status(400).json({ message: "User not found" });
        }
    
        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
    
        // Generate tokens
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        // Set tokens in cookies
        res.cookie("accessToken", accessToken, {
          httpOnly: true, // Prevents client-side access to the cookie
          secure: false,  // Set to false for development (not over HTTPS)
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,  // Set to false for development
        });

        // Send successful response with status 200
        return res.status(200).json({
          message: "Login successful",
          accessToken,
          refreshToken,
        });
      } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ message: error.message });
      }
});

const logoutUser = async (req, res) => {
    try {
        // Optional: Remove refresh token from the database if you store it there
        await User.findByIdAndUpdate(req.user._id, { refreshToken: "" }, { new: true });
        
        // Clear cookies and return a response
        res
            .clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: 'Strict' })  // Add options for security
            .clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: 'Strict' })
            .status(200)
            .json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const refreshAccessToken= async (req, res) => {
try {
    const incomingrefreshToken=req.cookies.refreshToken;
    const decodeuser=jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET); 
    const user=await User.findById(decodeuser.id);
    if(!user){
        return res.status(400).json({message:"User not found"});
    }
    if(user.refreshToken!==incomingrefreshToken){
        return res.status(400).json({message:"Invalid refresh token"});
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    const options={httpOnly : true, secure : false};    
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json({message:"Access token refreshed successfully"});

} catch (error) {
       console.error("Error in refreshing access token:", error);
        return res.status(500).json({ message: error.message });  
}
};

export { registerUser, loginUser, logoutUser ,refreshAccessToken};
