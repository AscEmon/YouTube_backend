import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/api_error.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/api_response.js";

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

export { registerUser }