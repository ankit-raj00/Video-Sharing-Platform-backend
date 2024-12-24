import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse}    from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"





const generateAcessandRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})



        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500 , "something went wrong while generating refresh and acess token")
    }
}



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
    //console.log("email :" , email);

    // if(fullName === ""){
    //     throw new ApiError(400 , "fullname is required" )
    // }

    if (
        [fullName , email , username , password].some((field)=>
        field?.trim() === "")
    ) {
        throw new ApiError(400 , "All fields are required")
    } 

    const existingUser = await User.findOne({
        $or :[{username } , {email}]           // finding in database if any one match

    })
    console.log(existingUser)
    if(existingUser){
        throw new ApiError(409 , "User with email or username already exist")
    }

    // middleware add more fields to request . we have created multer middleware we can use to get the image .
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required")
    }


    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
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
        username : username.toLowerCase(),
        password ,

    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"      // use to select all exect field name password and refreshToken
    )

    if(!createdUser){
        throw new ApiError(500 , "Something Went wrong while registering the user")
    }





    res.status(201).json(
        new ApiResponse(200 , createdUser , "User register Sucessfully")
    )
})

const loginUser = asyncHandler(async(req , res, next)=>{
    // req body-> data
    // username or email
    // find the user
    // password check
    // acess and refresh token
    // send cookies

    const {email , username , password} = req.body;

    if(!(username || email)){
        throw new ApiError(400 , "usename or email is requires")
    }

    const user = await User.findOne({
        $or : [{username} , {email}]
    })

    if(!user){
        throw new ApiError(404 , "user does not exist")
    }

    // for using a method we created in usermodel we need to apply on instance of User. 
    //Here we have created or accesed the one instance of User as user
    // user.model User is class of mongodb and we have acessed on instance of User i.e user

    const  isPasswordValid = await user.isPasswordCorrect(password)
    
    
    if(!isPasswordValid){
        throw new ApiError(401 , "Invalid password")
    }
    const {accessToken , refreshToken } = await generateAcessandRefreshTokens(user._id)
    


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser , accessToken,
                refreshToken
            },
            "userlogin sucessfully"
        )
    )

})


const logoutUser = asyncHandler(async(req , res )=>{
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined
            }
        },{
            new : true
        }
    )
    const options = {
        httpOnly : true,
        secure : true
    }
    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 , {} , "User logged Out"))
})

// we will use try catch under function also because at some operations we are not throwing if something bad happen
// so we need to keep in try catch to avoid any error

const refreshAccessToken = asyncHandler(async(req , res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401 , "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(401 , "invalid refresh token")
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401 , "Refresh token is expired or used")
        }
    
        const options ={
            httpOnly : true ,
            secure : true
        }
        const {accessToken , newrefreshToken} = await generateAcessandRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("acessToken" , accessToken , options)
        .cookie("refreshToken" , newrefreshToken , options)
        .json(
            new ApiResponse(
                200,
                {accessToken , refreshToken : newrefreshToken},
                "Accessed token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid refresh token")
    }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}; 
