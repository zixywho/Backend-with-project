import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const filter = { isPublished: true };

    if (query?.trim()) {
        filter.$or = [
            { title: { $regex: query.trim(), $options: "i" } },
            { description: { $regex: query.trim(), $options: "i" } }
        ];
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }

        filter.owner = userId;
    }

    const allowedSortFields = ["createdAt", "title", "views", "duration"];
    const field = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const direction = sortType.toLowerCase() === "asc" ? 1 : -1;

    const videos = await Video.find(filter)
        .populate("owner", "username fullName avatar")
        .sort({ [field]: direction })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            page: pageNum,
            limit: limitNum,
            totalVideos,
            totalPages: Math.ceil(totalVideos / limitNum)
        }, "Videos fetched successfully")
    );
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoPath = req.files?.videoFile?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    if (!videoPath || !thumbnailPath) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const videoUpload = await uploadCloudinary(videoPath);
    if (!videoUpload?.url && !videoUpload?.secure_url) {
        throw new ApiError(500, "Video upload failed");
    }

    const thumbnailUpload = await uploadCloudinary(thumbnailPath);
    if (!thumbnailUpload?.url && !thumbnailUpload?.secure_url) {
        throw new ApiError(500, "Thumbnail upload failed");
    }

    const video = await Video.create({
        title: title.trim(),
        description: description.trim(),
        videoFile: videoUpload.secure_url || videoUpload.url,
        thumbnail: thumbnailUpload.secure_url || thumbnailUpload.url,
        duration: videoUpload.duration || 0,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    }).populate("owner", "username fullName avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (
        (title !== undefined && (typeof title !== "string" || !title.trim())) ||
        (description !== undefined && (typeof description !== "string" || !description.trim()))
    ) {
        throw new ApiError(400, "Title and description cannot be empty");
    }

    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();

    const thumbnailPath = req.file?.path || req.files?.thumbnail?.[0]?.path;

    if (thumbnailPath) {
        const thumbnailUpload = await uploadCloudinary(thumbnailPath);

        if (!thumbnailUpload?.url && !thumbnailUpload?.secure_url) {
            throw new ApiError(500, "Thumbnail upload failed");
        }

        updates.thumbnail = thumbnailUpload.secure_url || thumbnailUpload.url;
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "Provide a title, description, or thumbnail to update");
    }

    const updatedVideo = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found or you are not authorized to update it");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const deletedVideo = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
    });

    if (!deletedVideo) {
        throw new ApiError(404, "Video not found or you are not authorized to delete it");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedVideo, "Video deleted successfully")
    );
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    });

    if (!video) {
        throw new ApiError(404, "Video not found or you are not authorized to update it");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video publish status toggled successfully")
    );
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
