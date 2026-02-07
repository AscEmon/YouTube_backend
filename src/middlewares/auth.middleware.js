import User from "../models/user.model.js";
import { ApiError } from "../utils/api_error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {


    try {
        // first get acessToken 
        // or check request header authorization to check acessToken
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        // if not find aceesToken 
        if (!token) {
            throw new ApiError(401, "Unathorized request");

        }

        // Decode the accessToken 
        const decodedAcessToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedAcessToken?.id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user

        // it will pass the next functions or middleware
        next()
    } catch (e) {
        throw new ApiError(401, e?.message || "Invalid Access")
    }
})