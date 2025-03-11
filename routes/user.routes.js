import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Register Route: POST /api/user/register
router.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser
);

// Login Route: POST /api/users/login
router.route('/login').post(loginUser);

// Logout Route: POST /api/users/logout (now POST instead of GET)
router.route('/logout').post(verifyJWT, logoutUser);

export default router;
