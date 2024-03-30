import { Router } from "express";
import { LogInUser, LogOutUser, RegisterUser, UserTokenRefreshing } from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { userAuthentication } from "../middlewares/auth.middlewares.js";

const router = Router()


router.route('/register').post(
    upload.fields(
    [
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ])
    , RegisterUser
    )

router.route('/login').post(
    LogInUser,
)

router.route('/logout').post(
    userAuthentication,
    LogOutUser,
)
router.route('/refresh-tokens').post(
    UserTokenRefreshing,
)

export default router;