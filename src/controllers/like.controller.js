import mongoose, {isValidObjectId, Types} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    
        
    console.log(videoId)
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400 , "video not found")
    }

    const likeStatus = await Like.aggregate([
        {
            $match : {
                video : new mongoose.Types.ObjectId(videoId),
                likedBy : new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])
    console.log(likeStatus)

    if(!likeStatus.length > 0){
        const newstatus = await Like.create({
            likedBy : req.user._id,
            video : videoId
        })
        if(!newstatus){
            throw new ApiError(400 , "Something went wrong")
        }

        return res.status(200).json(
            new ApiResponse(200 , newstatus , "user liked the video")
        )
    }else{
        const newstatus = await Like.deleteOne({
            likedBy : req.user._id,
            video : videoId
        })
        if(!newstatus){
            throw new ApiError(400 , "Something went wrong")
        }

        return res.status(200).json(
            new ApiResponse(200 , newstatus , "user removed like")
        )
    }

    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    console.log(commentId)
    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400 , "video not found")
    }

    const likeStatus = await Like.aggregate([
        {
            $match : {
                comment : new mongoose.Types.ObjectId(commentId),
                likedBy : new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])
    console.log(likeStatus)

    if(!likeStatus.length > 0){
        const newstatus = await Like.create({
            likedBy : req.user._id,
            comment : commentId
        })
        if(!newstatus){
            throw new ApiError(400 , "Something went wrong")
        }

        return res.status(200).json(
            new ApiResponse(200 , newstatus , "user liked the comment")
        )
    }else{
        const newstatus = await Like.deleteOne({
            likedBy : req.user._id,
            comment : commentId
        })
        if(!newstatus){
            throw new ApiError(400 , "Something went wrong")
        }

        return res.status(200).json(
            new ApiResponse(200 , newstatus , "user removed like")
        )
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    
    const allLikedVideo = await Like.aggregate([
        {
            $match : {
                likedBy : new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null }
            },
            
        },
        {
            $lookup : {
                from: "videos", 
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200 , allLikedVideo , "all video fetched")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}