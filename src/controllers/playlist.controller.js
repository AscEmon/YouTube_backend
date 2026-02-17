import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/api_error.js"
import { ApiResponse } from "../utils/api_response.js"
import { asyncHandler } from "../utils/async_handler.js"
import { User } from "../models/user.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!isValidObjectId(req.user.id)) {
        throw new ApiError(400, "Invalid user ID")
    }
    //TODO: create playlist
    const user = await User.findById(req.user.id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const playlist = await Playlist.create({
        name,
        description,
        user: req.user.id
    })
    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    //TODO: get user playlists
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const playlists = await Playlist.find({ user: userId }).populate("user")
    return res.status(200).json(new ApiResponse(200, playlists))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponse(200, playlist))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    // TODO: add video to playlist
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    playlist.videos.push(videoId)
    await playlist.save()
    return res.status(200).json(new ApiResponse(200, playlist))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    // TODO: remove video from playlist
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    playlist.videos.pull(videoId)
    await playlist.save()
    return res.status(200).json(new ApiResponse(200, playlist))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    // TODO: delete playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponse(200, playlist))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const { name, description } = req.body
    //TODO: update playlist
    const playlist = await Playlist.findByIdAndUpdate(playlistId, { name, description }, { new: true })
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponse(200, playlist))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}