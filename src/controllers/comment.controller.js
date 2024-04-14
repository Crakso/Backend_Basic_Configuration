import mongoose from "mongoose"
import { CommentDB } from "../models/comments.model.js"
import { apiError } from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    // const videoComments = await VideosDB.findById(videoId)
    const videoComments = await CommentDB.aggregate([
        {
            $match: {
                video: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "videodbs",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "userdbs",
                            localField: "owner",
                            foreignField: "_id",
                            as: "userDetails"

                        }
                    },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body
    if (content.trim() == "") {
        throw new apiError(404, "Comment is not be empty!")
    }

    const comments = await CommentDB.create({
        content,
        video: req.params.videoId,
        owner: req.user._id
    })

    res
        .status(201)
        .json(new apiResponse(
            200,
            "The Comment is added Successfully.",
            comments
        ))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const newContent = req.body.content

    if (newContent.trim() == "") {
        throw new apiError(404, "You cannot leave comment empty!")
    }

    const newComment = await CommentDB.findByIdAndUpdate(commentId,
        {
            $set: {
                content: newContent,
            }
        },
        {
            new: true
        }
    )

    res
        .status(200)
        .json(
            new apiResponse(
                200,
                "The Comment is Updated Successfully.",
                newComment
            ))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    await CommentDB.findByIdAndDelete(
        req.params.commentId,
        {
            new: true
        }
    )

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            "The Comment is deleted successfully.",
        )
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
