import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/api_error.js"
import { ApiResponse } from "../utils/api_response.js"
import { asyncHandler } from "../utils/async_handler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    const user = await User.findById(req.user.id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const subscription = await Subscription.findOne({
        subscriber: req.user.id,
        channel: channelId
    })
    if (subscription) {
        await subscription.deleteOne()
        return res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"))
    }
    const newSubscription = await Subscription.create({
        subscriber: req.user.id,
        channel: channelId
    })
    return res.status(200).json(new ApiResponse(200, newSubscription, "Subscribed successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber"
                }
            }
        },
        {
            $project: {
                subscriber: 1,
                createdAt: 1
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const user = await User.findById(subscriberId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel")
    return res.status(200).json(new ApiResponse(200, channels))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}