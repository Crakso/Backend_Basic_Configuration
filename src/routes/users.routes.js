import { Router } from "express";
import { 
    ChangeCurrentPassword,
    DeleteUserAccount,
    GetUserDetails,
    LogInUser,
    LogOutUser,
    RegisterUser, 
    UpdateCoverImage, 
    UpdateUserAvatar, 
    UpdateUserDetails, 
    UserTokenRefreshing, 
    getUserChannelDetails, 
    getUserWatchHistory 
} from "../controllers/users.controllers.js";
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

router.route('/change-password').post(
    userAuthentication,
    ChangeCurrentPassword
)

router.route('/user').get(
    userAuthentication,
    GetUserDetails
)

router.route('/update-account').patch(
    userAuthentication,
    UpdateUserDetails
)

router.route('/account/delete').delete(
    userAuthentication,
    DeleteUserAccount
)

router.route('/avatar').patch(
    upload.single("avatar"),
    userAuthentication,
    UpdateUserAvatar
)

router.route('/coverimage').patch(
    upload.single("coverImage"),
    userAuthentication,
    UpdateCoverImage
)

router.route('/channel/:username').get(
    userAuthentication,
    getUserChannelDetails
)

router.route('/watch-history').get(
    userAuthentication,
    getUserWatchHistory
)



export default router;