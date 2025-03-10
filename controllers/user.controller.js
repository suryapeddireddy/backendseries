import express from "express";
import asynchandler from "../utils/asynchandler.js";
import User from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";

const registerUser = asynchandler(async (req, res) => {
    const { email, password, fullname, username } = req.body;

    // Check if all required fields are provided
    if ([email, password, fullname, username].includes(undefined)) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(409).json({ message: "Email or username already exists" });
    }

    // Check if avatar and cover image files are uploaded
    const { avatar, coverImage } = req.files;
    if (!avatar || !coverImage) {
        return res.status(400).json({ message: "Avatar and Cover Image are required" });
    }

    // Upload to Cloudinary
    const avatarUrl = await uploadOnCloudinary(avatar[0].path);  // Assuming 'avatar' is an array
    const coverImageUrl = await uploadOnCloudinary(coverImage[0].path);

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
        coverimage: coverImageUrl
    });

    await newUser.save();

    // Send successful response
    const createdUser = await User.findById(newUser._id).select("-password");
    return res.status(201).json({ message: "User registered successfully", user: createdUser });
});

const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId); // Retrieve user by ID
        
        if (!user) {
            throw new Error("User not found");
        }

        // Generate access token (no need to save it)
        const accessToken = await user.generateAccessToken();
        
        // Generate refresh token (this is the one to save in the DB)
        const refreshToken = await user.generateRefreshToken();
        
        // Store refresh token in the database (if needed)
        user.refreshToken = refreshToken; // Assuming you have a field to store the refresh token
        await user.save({ validateBeforeSave: false }); // Save the user with the new refresh token

        // Return the access token and refresh token to the client
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        throw new Error("Token generation failed");
    }
}


const LoginUser=asynchandler(async(req,res)=>{
//req.body->data
// username or email 
// find the user
// compare the password
// generate token
// send the token    
// 
const {email,password,username}=await req.body;
if([email,username].includes(undefined)){
    return res.status(400).json({message:"Email or username is required"}); 
}
const user=await User.findOne({$or:[{email},{username}]});
if(!user){
    return res.status(404).json({message:"User not found"});
}
const isPasswordMatch=await user.matchPassword(password);
if(!isPasswordMatch){
    return res.status(401).json({message:"Invalid credentials"});
}
const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id);

const loggedinUser=User.findById(user._id).select("-password");
const options={
httponly:true,
secure:true
};
return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json({ 
    message: "User logged in successfully", 
    user: loggedinUser, 
    accessToken, // Send the access token for localstorage
    refreshToken 
  });
});

const logoutUser = asynchandler(async (req, res) => {
await User.findByIdAndUpdate(req.user._id, { refreshToken: "" }, { new: true });
return res.status(200)
.clearCookie("accessToken")
.clearCookie("refreshToken")
.json({ message: "Logged out successfully" });
});
export { registerUser ,LoginUser,logoutUser};