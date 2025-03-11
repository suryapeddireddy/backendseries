import { Router } from "express";
import { registerUser ,loginUser,logoutUser} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.route('/register').post(
    upload.fields([
        {name: 'avatar', maxCount: 1},
        {name: 'coverImage', maxCount: 1}
    ]),
    registerUser);   // POST /api/user/register
router.route('/login').post(loginUser);   // POST /api/user/login
router.route('/logout').get(verifyJWT,logoutUser);   // GET /api/user/logout
export default router;