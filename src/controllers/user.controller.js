import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/api_error.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/api_response.js";
import jwt from "jsonwebtoken";

const generateRefreshAndAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (e) {
        throw new ApiError(500, "Something went wrong while generating acces and refresh token")

    }


}


const registerUser = asyncHandler(async (req, res) => {

    // get data from user
    // check validation
    // check if user already exists
    // check avatar and coverImage vaidation
    // avatar and coverImage upload in cloudinary
    // create user
    // return response

    const { userName, email, fullName, password } = req.body

    // Check validation
    if ([userName, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists")
    }

    // Check avatar and coverImage vaidation
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    if (req.files?.coverImage?.[0]) {
        coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    } else {
        coverImageLocalPath = ""
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Upload avatar and coverImage in cloudinary
    const avatarResult = await uploadOnCloudinary(avatarLocalPath)
    if (!avatarResult) {
        throw new ApiError(400, "Avatar file is required")
    }

    let coverImageResult;
    if (coverImageLocalPath) {
        coverImageResult = await uploadOnCloudinary(coverImageLocalPath)
        if (!coverImageResult) {
            throw new ApiError(400, "Cover image upload failed")
        }
    }

    // Create user
    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatarResult.url,
        coverImage: coverImageResult?.url || ""
    })
    // Remove password and refreshToken from response
    const createUser = await User.findById(user._id).select(" -password -refreshToken ").exec()


    if (!createUser) {
        throw new ApiError(500, "Server error while creating user")
    }
    return res.status(201).json(new ApiResponse(200, createUser, "User created successfully",))

})

const loginUser = asyncHandler(async (req, res) => {

    // Get email and password from fortend
    // validate this data
    // check password
    // check this data is exist in database or not
    // if exist then create accessTokena and RefreshToken
    // store refreshToken in Database
    // send response

    const { userName, email, password } = req.body
    if (!userName && !email) {
        throw new ApiError(400, "Username or Email is required")
    }
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid user credentials")
    }
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken,
                },
                "User logged In Successfully"
            )
        )




})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }

    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))


})


const generateRefreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!refreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedRefreshToken?.id).select(" -password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateRefreshAndAccessToken(user._id)
        const options = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Refresh Token Generated Successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }


})


const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?.id)

    const isPasswordValid = user.comparePassword(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(422, "Invalid Password")
    }
    user.password = newPassword
    await user.save();

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?.id)
        .select("-password -refreshToken")

    return res.status(200)
        .json(new ApiResponse(200, user, "User data fetched"))

})


const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName } = req.body

    if (!fullName) {
        throw new ApiError(400, "Full name is required")
    }
    const user = await User.findByIdAndUpdate(req.user?.id, {
        $set: {
            fullName,
        }
    }, {
        new: true
    }).select(" -password -refreshToken")
    return res.status(200)
        .json(new ApiResponse(200, user, "User data updated successfully"))
})


export { registerUser, loginUser, logoutUser, generateRefreshToken, changePassword, getCurrentUser, updateAccountDetails }