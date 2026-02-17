
import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/api_error.js"
import { ApiResponse } from "../utils/api_response.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { Schema } from "mongoose"


const createComment = asyncHandler(async (req, res) => {

    const { userName } = req.user;
    if (!userName) {
        throw new ApiError(401, "Unauthorized")
    }
    console.log(req.body)
    const { videoId } = req.body;
    console.log(videoId)

    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Comment is required")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        content,
        video: video,
        owner: req.user._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment created successfully"))
})


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comments = await Comment.find({ video: videoId })

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})


const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Comment is required")
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    comment.content = content;
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"))
})


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized")
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"))
})


export { createComment, getVideoComments, updateComment, deleteComment }


