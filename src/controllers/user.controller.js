import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse}    from "../utils/ApiResponse.js"



const registerUser = asyncHandler(async(req , res , next)=>{
    // get user detail from frontend
    // validation - not empty
    // check if user already exist : username , email
    //check for image , check for avatar
    //upload them to cloudinary
    //create user object - create entry in db
    //remove password and refrsh token field from response
    //check for user creation
    //return res

    const{fullName , email , username , password} = req.body
    console.log("emai :" , email);

    // if(fullName === ""){
    //     throw new ApiError(400 , "fullname is required" )
    // }

    if (
        [fullName , email , username , password].some((field)=>
        field?.trim() === "")
    ) {
        throw new ApiError(400 , "All fields are required")
    } 

    const existingUser = User.findOne({
        $or :[{username } , {email}]           // finding in database if any one match

    })
    if(existingUser){
        throw new ApiError(409 , "User with email or username already exist")
    }

    // middleware add more fields to request . we have created multer middleware we can use to get the image .
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400 , "Avatar file is required")
    }

    const user = await  User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        username : username.toLoweCase(),

    })
    createdUser = await User.findById(user._id).select(
        "-password -refreshToken"      // use to select all exect field name password and refreshToken
    )

    if(!createdUser){
        throw new ApiError(500 , "Something Went wrong while registering the user")
    }





    res.status(201).json(
        new ApiResponse(200 , createdUser , "User register Sucessfully")
    )
})


export {registerUser}; 
