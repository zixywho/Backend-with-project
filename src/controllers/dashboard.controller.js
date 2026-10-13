import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    const totalViewsAndVideos = await Video.aggregate([
        {
            $match : {owner : req.user._id}
        },
        {
            $group : {
                _id : "$owner",
                totalViews : {$sum : "$views"},
                totalVideos : {$sum : 1}
            }
        }
    ])
    let totalSubscribers = await Subscription.countDocuments({
        channel : req.user._id
    })
    if (!totalSubscribers) totalSubscribers = 0;
    const videos = await Video.find({
        owner: req.user._id
    }).select("_id");

    const videoIds = videos.map(video => video._id);
    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    });

    const data = {
        totalViews: totalViewsAndVideos[0]?.totalViews ?? 0,
        totalVideos: totalViewsAndVideos[0]?.totalVideos ?? 0,
        totalSubscribers,
        totalLikes
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,data, "Channel stats fetched successfully")
    )
    

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find({
        Owner : req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200,videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }