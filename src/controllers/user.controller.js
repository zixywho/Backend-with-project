import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";

const generateAccesAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}

    }
    catch{
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

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

    const {fullname,email,username,password} = req.body;
    //console.log("name",fullname);

    if ([fullname,email,username,password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "Name is required");
    }

    const existingUser = await User.findOne({
        $or : [{ email },{ username }]
    })
    if (existingUser){
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!avatar){
        throw new ApiError(400, "Avatar is required");
    }

    const user = await User.create({
        fullname, 
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

const loginUser = asyncHandler(async (req,res) => {
    //req body se data
    //username or email ke basis pe
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password} = req.body;
    if (!username && !email){
        throw new ApiError(400, "Username or email is required")
    }
    const user = await User.findOne({
        $or : [{username},{email}]
    })
    if (!user){
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid){ 
        throw new ApiError(401, "Invalid password")
    }
    const {accessToken,refreshToken} = await generateAccesAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,accessToken,refreshToken
            },
            "User logged in sucessfully"
        )
    )

})
const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly : true,
        secure : true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken").json(new ApiResponse(200,{},"User logged out"))
})
export { registerUser,
    loginUser,
    logoutUser
 };