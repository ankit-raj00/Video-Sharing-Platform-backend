import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import { connect } from "http2"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 2} = req.query

    // validate videoId
    //aggregate all comment of that videoId

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100); // Enforce min 1 and max 100

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400 , "give Valid VideoId")
    }

    const comments = await Comment.aggregate([
        {
            $match : {video : new mongoose.Types.ObjectId(videoId)}
        },{
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : 'ownerdetail',
                pipeline :[{
                    $project: {
                        username: 1,
                        avatar: 1,
                        fullName : 1 ,
                    } 
                }],
            }
        },
        
        {
            $skip: (pageInt - 1) * limitInt, // Pagination: Skip to the correct page
          },
          {
            $limit: limitInt, // Limit the results based on the requested limit
          },
    ])

    console.log(comments)

    return res.status(200).json(
        new ApiResponse(200 , comments , "all comments fetched")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const { content } = req.body
    console.log('Request Body:', req.body);
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required to add a comment");
    }
    
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400 , "give Valid VideoId")
    }
    const addedComment = await Comment.create({
        content : content,
        owner : req.user._id,
        video : videoId
    })

    

    

    if(!addComment){
        throw new ApiError(400 , "comment was not added Try again")
    }
   


    console.log(req.body)

        return res.status(200).json(
        new ApiResponse(200 , {addedComment} , "comment added sucessfully")
    )


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    
    const {commentId} = req.params
    const { content } = req.body

    const commentInfo = await Comment.findById(commentId)

    if(!req.user._id.equals(commentInfo.owner)){
        throw new ApiError(400 , "unauthorized access")

    }
    

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required to add a comment");
    }
    const updatedComment = await Comment.findByIdAndUpdate(

        commentId , 
        
        {
            $set : {content : content}
        },
        {
            new : true
        }
    )

    console.log(updatedComment)
    

    if(!updatedComment){
        throw new ApiError(400 , "comment not updated")
    }

    return res.status(200).json(
        new ApiResponse(200 , {updatedComment} , "comment updated")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params

    const commentInfo = await Comment.findById(commentId)

    if(!req.user._id.equals(commentInfo.owner)){
        throw new ApiError(400 , "unauthorized access")

    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)

if(!deletedComment){
    throw new ApiError(400 , "comment not delted try again")
}

return res.status(200).json(
    new ApiResponse(200 , deletedComment , "comment deleted successfully")
)
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }