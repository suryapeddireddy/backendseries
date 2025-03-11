import { Router } from "express";
import { registerUser, loginUser, logoutUser ,refreshAccessToken} from "../controllers/user.controller.js";
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

//add refresh token route
router.route('/refresh').get(refreshAccessToken);
export default router;
