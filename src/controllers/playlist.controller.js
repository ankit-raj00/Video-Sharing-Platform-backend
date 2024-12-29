import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name , description} = req.body
    console.log(req.body)

    //TODO: create playlist
    const playlist = await Playlist.create({
        name : name ,
        description : description,
        owner : req.user._id
    })

    if(!playlist){
        throw new ApiError(400 , "playlist not created")
    }

    return res.status(200).json(
        new ApiResponse(200 , playlist , "playlist created")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(400 , "user not found")
    }

    const playlists = await Playlist.aggregate([
        {
            $match : {owner : new mongoose.Types.ObjectId(userId)}
    }
])

    return res.status(200).json(
        new ApiResponse(200 , playlists , "all playlist of user fetched")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    try {
        const playlists = await Playlist.findById(playlistId)

        return res.status(200).json(
            new ApiResponse(200 , playlists , "Playlist fetched")
        )
    } catch (error) {
        throw new ApiError(400 , "something went wrong while fetching playlist")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlists = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)
    if(!playlists){
        throw new ApiError(400 , "playlist not found")
    }
    if(!video){
        throw new ApiError(400 , "video not found")
    }
    if(!req.user._id.equals(playlists.owner)){
        throw new ApiError(400 , "unauthorized access")

    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId , 
        { $addToSet: { videos : videoId } },
    {
        new : true
    })

    if(!playlist){
        throw new ApiError(400 , "video not added to playlist")
    }

    return res.status(200).json(
        new ApiResponse(200 , playlist , "video get added")
    )
    
    })

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlists = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)
    if(!playlists){
        throw new ApiError(400 , "playlist not found")
    }
    if(!video){
        throw new ApiError(400 , "video not found")
    }
    if(!req.user._id.equals(playlists.owner)){
        throw new ApiError(400 , "unauthorized access")

    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true } // Returns the updated document
    );

    if(!playlist){
        throw new ApiError(400 , "video not deleted  from playlist")
    }

    return res.status(200).json(
        new ApiResponse(200 , playlist , "video get removed")
    )


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const playlists = await Playlist.findById(playlistId)
    
    if(!playlists){
        throw new ApiError(400 , "playlist not found")
    }
    
    if(!req.user._id.equals(playlists.owner)){
        throw new ApiError(400 , "unauthorized access")

    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(400 , "video not deleted  from playlist")
    }

    return res.status(200).json(
        new ApiResponse(200 , playlist , "video get removed")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    const playlists = await Playlist.findById(playlistId)
    
    if(!playlists){
        throw new ApiError(400 , "playlist not found")
    }
   
    if(!req.user._id.equals(playlists.owner)){
        throw new ApiError(400 , "unauthorized access")

    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name : name,
            description : description

         },
        { new: true } // Returns the updated document
    );

    if(!playlist){
        throw new ApiError(400 , "video not deleted  from playlist")
    }

    return res.status(200).json(
        new ApiResponse(200 , playlist , "video get removed")
    )
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