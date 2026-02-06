import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/api_error.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/api_response.js";

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
        .json(ApiResponse(200, {}, "User logged out"))


})

export { registerUser, loginUser, logoutUser }