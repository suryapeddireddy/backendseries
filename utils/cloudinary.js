import { v2 as cloudinary } from "cloudinary";  // Correct import of Cloudinary
import { promises as fsPromises } from 'fs';  // Using promises for async file deletion
import dotenv from 'dotenv';
dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {string} file - Path of the file to upload
 * @returns {Promise<string|null>} - Secure URL of uploaded file or null if failed
 */
export const uploadOnCloudinary = async (file) => {
    try {
        if (!file) throw new Error("File path is required");

        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(file, {
            resource_type: "auto",  // Correct option name
        });

        // After successful upload, delete the local file asynchronously
        try {
            await fsPromises.unlink(file);  // Deleting the local file after upload
        } catch (error) {
            console.error("Failed to delete local file:", error);
        }

        // Return the URL of the uploaded file on Cloudinary
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);

        // If the upload failed, attempt to delete the local file (if it exists)
        try {
            await fsPromises.unlink(file);
        } catch (unlinkError) {
            console.error("Failed to delete local file after upload failure:", unlinkError);
        }

        // Return null if upload fails
        return null;
    }
};
