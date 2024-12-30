import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const totalVideo = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $group: {
                _id: null, 
                totalVideos: { $sum: 1 }, 
                totalViews: { $sum: "$views" } 
            }
        }
    ])
    const totallikes = await Like.aggregate([
        {
            $match : {
                likedBy : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $count : "totallikes"
        }
    ])
    const totalsubscribers = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $count : "totalsubscribers"
        }
    ])

    return res.status(200).json(
        new ApiResponse(200 , {totalsubscribers , totallikes , totalVideo} , "channel stats fetched ")
    )
    

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const allVideo = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        
    ])

    return res.status(200).json(
         new ApiResponse(
            200 , allVideo , "all videos fetched"
         )
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }