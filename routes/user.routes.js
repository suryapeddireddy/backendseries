import { Router } from "express";
import { registerUser, loginUser, logoutUser ,refreshAccessToken,changeCurrentpassword,getcurrentUser,updatecurrentDetails,updateUserAvatar,updateUsercoverImage} from "../controllers/user.controller.js";
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

//secure routes
router.route('/refresh').get(refreshAccessToken);
router.route('/change-password').post(verifyJWT,changeCurrentpassword);
router.route('/me').get(verifyJWT,getcurrentUser);
router.route('/update-me').patch(verifyJWT,updatecurrentDetails);
router.route('/update-avatar').patch(verifyJWT,upload.single('avatar'),updateUserAvatar);
router.route('/update-cover-image').patch(verifyJWT,upload.single('coverImage'),updateUsercoverImage);
export default router;
