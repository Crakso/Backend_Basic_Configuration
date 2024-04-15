import mongoose, { Mongoose, isValidObjectId } from "mongoose"
import { VideosDB } from '../models/videos.model.js'
import { UserDB } from "../models/users.model.js"
import { apiError } from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
// import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const userVideos = await VideosDB.aggregate([
        {
            $match: {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
    ])

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            "All user videos fetched successfully.",
            userVideos
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoFilePath =  req.files.videoFile[0]?.path
    const thumbnailPath = req.files.thumbnail[0]?.path

    if(!(title && description)){
        throw new apiError(404,"Title and description is required!")
    }
    if(!(videoFilePath && thumbnailPath)){
        throw new apiError(404,"Videos and thumbnail is required!")
    }


    const publishingVideo = await VideosDB.create(
        {
            videoFile: videoFilePath,
            thumbnail: thumbnailPath,
            title,
            owner: req.user._id,
            description,
            // duration: videoFilePath?.path   //In cloudnary we have a feature to get duration of a video url.duration.
        }
    )

    const publishedVideo = await VideosDB.findById(publishingVideo._id);
    res
    .status(201)
    .json(
        new apiResponse(
            200,
            "The Video is published successfully.",
            publishedVideo
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await VideosDB.findById(videoId)

    res
        .status(200)
        .json(new apiResponse(
            200,
            "The video is fetched successfully.",
            video
        ))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const { title, description} = req.body
    //TODO: update video details like title, description, thumbnail
    const thumbnail = req.files?.thumbnail[0]?.path

    if (!title || !description || !thumbnail) {
        throw new apiError(404, "title, description and thumbnail is required!")
    }

    const newVideo = await VideosDB.findByIdAndUpdate(videoId,
        {
            $set: {
                title: title,
                description: description,
                thumbnail: thumbnail
            }
        },
        {
            new: true
        }
    )
    res
        .status(200)
        .json(new apiResponse(
            200,
            "The Video is Updated Successfully.",
            newVideo
        ))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await VideosDB.findByIdAndDelete(videoId,
        {
            new: true
        })

        if(!video){
            throw new apiError(404,"Video Not Found!")
        }
    res
        .status(200)
        .json(new apiResponse(200, "The Video is deleted successfully."))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await VideosDB.findById(videoId)

    if (!video) {
        throw new apiError(400, "Video Not Found!")
    }

    if (video?.owner !== req.user._id) {
        throw new apiError(401, "You are unauthorized for this function!")
    }
    const isPublished = !video.isPublished

    video.updateOne({
        set: {
            isPublished
        }
    },
        {
            new: true
        })

    res
        .status(200)
        .json(
            new apiResponse(
                200,
                "isPublished Toggled Successfully."
            )
        )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
