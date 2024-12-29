import mongoose, {isValidObjectId, Query} from "mongoose"
import fs from "fs"

import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary , deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc" , userId } = req.query;
  
    // Convert page and limit to integers with validation

    
    const pageInt = parseInt(page, 10) || 1;
    const limitInt = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100); // Enforce min 1 and max 100
  
    // Determine sorting order
    const sortOrder = sortType === "asc" ? 1 : -1;
  
    // Aggregate the videos
    
    const videos = await Video.aggregate([
      {
        $match: { isPublished: true }, // Filter only published videos
      },
      {
        $match: userId ? { owner: new mongoose.Types.ObjectId(userId) } : {},
      },
      {
        $lookup: {
          from: "users", // Lookup owner info from users collection
          localField: "owner", // Field to match
          foreignField: "_id", // Matching the _id from the users collection
          as: "ownerInfo", // Output the results in "ownerInfo" field
          pipeline: [
            {
              $project: {
                username: 1,
                fullName: 1,
                avatar: 1, // Only include selected fields from the owner (user)
              },
            },
          ],
        },
      },
      {
        $addFields: {
          // Add owner_detail field, fallback to {} if ownerInfo is empty
          owner_detail: {
            $ifNull: [{ $arrayElemAt: ["$ownerInfo", 0] }, {}],
          },
        },
      },
      {
        $match: query
          ? {
              // Search for query in title or description (case-insensitive)
              $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
              ],
            }
          : {},
      },
      {
        $sort: { [sortBy]: sortOrder }, // Sort by the specified field and direction
      },
      {
        $skip: (pageInt - 1) * limitInt, // Pagination: Skip to the correct page
      },
      {
        $limit: limitInt, // Limit the results based on the requested limit
      },
    ]);
  
    // Return the result in the API response
    return res.status(200).json(new ApiResponse(200, videos, "All videos fetched"));
  });
  

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const user = await User.findById(req.user._id)
    
    const videofileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalpath = req.files?.thumbnail[0]?.path

    if(!videofileLocalPath && !thumbnailLocalpath){
        throw new ApiError(400 , "thumbnail and videofile required ")
    }
    
    const videofile = await uploadOnCloudinary(videofileLocalPath)

    const thumbnail = await uploadOnCloudinary(thumbnailLocalpath)

    if(!videofile){
        throw new ApiError(400 , "video file not uploaded")
    }
    if(!thumbnail){
        throw new ApiError(400 , "thumbnail file not uploaded")
    }
    const video = await  Video.create({
        videoFile : videofile?.url,
        thumbnail : thumbnail?.url,
        title : title ,
        description : description,
        duration : videofile?.duration,
        owner : user._id,

    })
    console.log(video)
    const createdvideo = await Video.findById(video._id)
    if(!createdvideo){
        throw new ApiError(409 , "something went wrong while uploading video and thumbnail")
    }


    return res.status(200).json(new ApiResponse(200 , createdvideo , "video uploaded sucessfully"))


    
    
    

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id


    const updatedhistory = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { watchHistory: videoId } },
      { new: true } // Return the updated document
    ).select("-password -refreshToken");
    
    await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } }
      ,
      { new: true } // Return the updated document
    );
  
    const video = await Video.findById(videoId).populate({
        path : "owner",
        select : "-password -refreshToken"
    })

    if(!video){
        throw new ApiError(400 , "give valid Video Id")
    }
    

    if(!updatedhistory){
      throw new ApiError(400 , "history not updated")
    }



    return res.status(200).json(
        new ApiResponse(200 , {video , updatedhistory} , "video fetched")
    )


})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description} = req.body

    //TODO: update video details like title, description, thumbnail
    // extract owner id from video Id
    //if owner Id and login user is same then acess to update
    //get coludinary video and thumnbnail id using links
    // store id in variables
    //when sucessfully we update the detail delete the video and thumbnail using id
    
    const videoinfo = await Video.findById(videoId)
    if(!videoinfo){
        throw new ApiError(400 , "Invalid video id")
    }

    if(!req.user._id.equals(videoinfo.owner)){
        fs.unlinkSync(req.file?.path);
        throw new ApiError(400 , "unauthorized access")

    }
    const oldthumbnail = videoinfo.thumbnail
    const newthumbnailLocalPath = req.file?.path

    const newthumbnail = await uploadOnCloudinary(newthumbnailLocalPath)
    if(!newthumbnail){
        throw new ApiError(400 , "Error in uploading video on cloudinary")
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
          $set: {
            thumbnail: newthumbnail.url,
            title: title,
            description: description,
          },
        },
        { new: true } // Returns the updated document
      );

      if(!video){
        throw new ApiError(400 , "Error in updating")
      }
      const videodelete = await deleteFromCloudinary(oldthumbnail);
      
      console.log(videodelete)
    


    res.status(200).json(
        new ApiResponse(200 , video , "Thumbnail , title , description updated successfully")
    )

})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const videoinfo = await Video.findById(videoId)
    if(!videoinfo){
        throw new ApiError(400 , "Invalid video id")
    }

    if(!req.user._id.equals(videoinfo.owner)){
        throw new ApiError(400 , "unauthorized access")

    }
    const thumbnail = videoinfo.thumbnail
    const videofile = videoinfo.videoFile

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
    return res.status(404).json({ message: "Video not found" });
    }
    const deleteThumbnail = await deleteFromCloudinary(thumbnail)
    const deleteVideoFile = await deleteFromCloudinary(videofile)

    if(!deleteThumbnail && !deleteVideoFile){
        throw new ApiError(400 , "video and thumbnail not deleted")
    }
    console.log(deleteThumbnail , deleteVideoFile , videofile)

    res.status(200).json(new ApiResponse(200 , video , "video deleted sucessfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const videoinfo = await Video.findById(videoId)
    if(!videoinfo){
        throw new ApiError(400 , "Invalid video id")
    }

    if(!req.user._id.equals(videoinfo.owner)){
        throw new ApiError(400 , "unauthorized access")

    }
    const updatedVideo = await Video.findOneAndUpdate(
        { _id: videoId },
        [{ $set: { isPublished: { $not: "$isPublished" } } }], // Use aggregation pipeline to toggle the field
        { new: true } // Returns the updated document
      );
      
      if (!updatedVideo) {
        throw new Error('Video not found');
      }
      
      res.status(200).json(new ApiResponse(200 , updatedVideo , `toggle updated sucessfully ${videoinfo.isPublished} to ${updatedVideo.isPublished}`))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}