import { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/api_error.js"
import { ApiResponse } from "../utils/api_response.js"
import { asyncHandler } from "../utils/async_handler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!isValidObjectId(req.user.id)) {
        throw new ApiError(400, "Invalid user ID")
    }
    if (!content) {
        throw new ApiError(400, "Content is required")
    }
    //TODO: create tweet
    const user = await User.findById(req.user.id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const tweet = await Tweet.create({
        content,
        user: req.user.id
    })
    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    // TODO: get user tweets
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const tweets = await Tweet.find({ user: userId }).populate("user")
    return res.status(200).json(new ApiResponse(200, tweets))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    if (!content) {
        throw new ApiError(400, "Content is required")
    }
    //TODO: update tweet
    const tweet = await Tweet.findByIdAndUpdate(tweetId, { content }, { new: true })
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    return res.status(200).json(new ApiResponse(200, tweet))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    //TODO: delete tweet
    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    return res.status(200).json(new ApiResponse(200, tweet))
})

const likeTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    //TODO: like tweet
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    tweet.likes.push(req.user.id)
    await tweet.save()
    return res.status(200).json(new ApiResponse(200, tweet))
})

const unlikeTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    //TODO: unlike tweet
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    tweet.likes.pull(req.user.id)
    await tweet.save()
    return res.status(200).json(new ApiResponse(200, tweet))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    likeTweet,
    unlikeTweet
}   