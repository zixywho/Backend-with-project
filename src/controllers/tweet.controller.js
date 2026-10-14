import mongoose, { isValidObjectId, Mongoose } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if (!content|| !content.trim()) {
        throw new ApiError(400, "Tweet is required")
    }
    const tweetCreated = await Tweet.create({
        content : content,
        owner : req.user._id
    })
    if (!tweetCreated){
        throw new ApiError(500, "Something went wrong while creating the tweet");
    }
    return res.status(201).json(
        new ApiResponse(201,tweetCreated,"tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    if (!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id")
    }
    const tweets = await Tweet.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project : {
                content : 1,
                createdAt : 1
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, "tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;
    if (!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet Id")
    }

    if (!content || !content.trim()){
        throw new ApiError(400, "Tweet content is required");
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id : tweetId,
            owner : req.user._id
        },
        {
            $set : {
                content : content.trim()
            }
        },
        {new : true, runValidators : true}
    )
    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found or you are not authorized to update it");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedTweet, "Tweet updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    if (!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet Id")
    }
    const deletedTweet = await Tweet.findOneAndDelete(
        {
            _id : tweetId,
            owner : req.user._id
        }
    )
    if (!deletedTweet) {
        throw new ApiError(404, "Tweet not found or you are not authorized to delete it");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
    );

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}