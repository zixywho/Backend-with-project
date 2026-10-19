import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)){
        throw new ApiError(400,"channel id is not valid")
    }
    if (channelId == req.user._id.toString()){
        throw new ApiError(400,"You cannot subscriebr to your own channel")
    }
    const channelExist = await User.findById(channelId)
    if (!channelExist) {
        throw new ApiError(400, "channel doesnt exist")
    }

    const subscription = await Subscription.findOne({
        subscriber : req.user._id,
        channel : channelId
    })
    if (!subscription){
        //subscribe and create
        const addedSubscription = await Subscription.create({
            subscriber : req.user._id,
            channel : channelId
        })
        res
        .status(201)
        .json(new ApiResponse(201,addedSubscription,"Subscription added successfully"))
    }
    else{
        const deletedSubscription = await Subscription.findOneAndDelete({
            subscriber : req.user._id,
            channel : channelId
        })
        res
        .status(200)
        .json(new ApiResponse(200,deletedSubscription,"Subscription removed successfully"))
    }


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)){
        throw new ApiError(400, "channel id is not valid")
    }
    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.find({
        channel: channelId
    }).populate("subscriber", "username fullName avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Channel subscribers fetched successfully"
        )
    );

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const user = await User.findById(subscriberId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const subscriptions = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "username fullName avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            subscriptions,
            "Subscribed channels fetched successfully"
        )
    );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}