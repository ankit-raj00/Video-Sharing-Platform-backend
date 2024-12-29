import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { subscribe } from "diagnostics_channel"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    console.log(channelId)
    const channel = await User.findById(channelId)

    if(!channel){
        throw new ApiError(400 , "channel not found")
    }

    const channelStatus = await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(req.user._id),
                channel : new mongoose.Types.ObjectId(channelId)
            }
        }
    ])
    console.log(channelStatus)

    if(!channelStatus.length > 0){
        const newstatus = await Subscription.create({
            subscriber : req.user._id,
            channel : channelId
        })
        if(!newstatus){
            throw new ApiError(400 , "Something went wrong")
        }

        return res.status(200).json(
            new ApiResponse(200 , newstatus , "user subscribed")
        )
    }else{
        const newstatus = await Subscription.deleteOne({
            subscriber : req.user._id,
            channel : channelId
        })
        if(!newstatus){
            throw new ApiError(400 , "Something went wrong")
        }

        return res.status(200).json(
            new ApiResponse(200 , newstatus , "user unsubscribed")
        )
    }
      
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log(req.params)
    const channel = await User.findById(channelId)

    

    if(!req.user._id.equals(channelId)){
        throw new ApiError(400 , "unauthorized access")

    }

    if(!channel){
        throw new ApiError(400 , "channel not found")
    }
    
    try {
        const Subscribers = await Subscription.aggregate([
            {
                $match: {channel : new mongoose.Types.ObjectId(channelId)}
            },{
                $lookup : {
                    from : "users",
                    localField : "subscriber",
                    foreignField : "_id",
                    as : "subscriber detail",
                    pipeline : [
                        {
                            $project : {
                                fullName : 1,
                                avatar : 1 ,
                                email : 1 ,
                                username : 1 ,
                            }
                        }
                    ]
                }
            },{
                $lookup : {
                    from : "subscriptions",
                    localField : "subscriber" ,
                    foreignField : "channel",
                    as : "subscribersubscriber"
                } ,
                
                
            },
            {$addFields: {
                subscriberCount: { $size: "$subscribersubscriber" }}}
        ])

        return res.status(200).json(
            new ApiResponse(200 , Subscribers , "Subscribers fetched")
        )
    } catch (error) {
        throw new ApiError(400 , "something went wrong while finding subscribers")
        
    }

    


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    

    const channels = await Subscription.aggregate([
        {
            $match : {subscriber :new mongoose.Types.ObjectId(subscriberId) }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200 , channels , "channels fetched")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}