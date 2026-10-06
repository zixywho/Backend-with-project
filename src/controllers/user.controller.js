import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req,res) => {
    //get user details from frontend
    //validate user details
    //check if user already exists
    //check for images, avatar
    //upload images to cloudinary
    //create user in database
    //remove password and other sensitive data from response
    //check for user creation success
    //send response to frontend

    const {name,email,username,password} = req.body;
    console.log("name",name);

    if ([name,email,username,password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "Name is required");
    }

    const existingUser = await User.findOne({
        $or : [{ email },{ username }]
    })
    if (existingUser){
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!avatar){
        throw new ApiError(400, "Avatar is required");
    }

    const user = User.create({
        fullName, 
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })
    //select , has everything selected by default, giving -field, will remove it
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})

export { registerUser };