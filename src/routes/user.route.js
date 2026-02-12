import { Router } from "express";
import { registerUser, loginUser, logoutUser, generateRefreshToken, getCurrentUser, changePassword, updateAccountDetails, avatarUpdate, coverImageUpdate, getUserChannelProfile, getUserWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(

    // middleware where we use multer for file
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)


router.route("/login").post(upload.none(), loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(generateRefreshToken)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/getUser").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar-update").patch(
    // middleware where we use multer for file
    upload.single("avatar"),
    verifyJWT,
    avatarUpdate
)

router.route("/cover-image-update").patch(
    // middleware where we use multer for file
    upload.single("coverImage"),
    verifyJWT,
    coverImageUpdate
)

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getUserWatchHistory)

export default router