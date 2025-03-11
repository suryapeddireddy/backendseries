import express from "express";
import asynchandler from "../utils/asynchandler.js";
import User from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";

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
    
        res.json({
          message: "Login successful",
          accessToken,
          refreshToken,
        });
      } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ message: error.message });
      }
});

const logoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: "" }, { new: true });
    return res.status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json({ message: "Logged out successfully" });
});

export { registerUser, loginUser, logoutUser };
