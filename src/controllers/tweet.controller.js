import mongoose from "mongoose"
import { TweetDB } from "../models/tweets.model.js"
import { UserDB } from "../models/users.model.js"
import { apiError } from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (content?.trim() === "") {
        throw new apiError(404, "Content is empty!")
    }

    const tweet = await TweetDB.create({
        content,
        owner: req.user._id
    })
    if (!tweet) {
        throw new apiError(404, "Tweet is not exist!")
    }

    res
        .status(201)
        .json(
            new apiResponse(200, "Tweet is created Successfully.", tweet)
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    //    const tweet =  await TweetDB.find({owner:req.user._id}).select("-owner -_id")
    //     res
    //     .status(200)
    //     .json(
    //         new apiResponse(
    //             200,
    //             "Tweets is fetched successfully.",
    //             tweet
    //         )
    //     )
    const { userId } = req.params

    if (!userId) {
        throw new apiError(400, "UserId is  Missing!")
    }

    const tweet = await UserDB.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'tweetdbs',
                localField: '_id',
                foreignField: 'owner',
                as: 'tweets',
                pipeline: [{
                    $project: {
                        content: 1,
                    }
                }]
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                tweets: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ])
    if (!tweet) {
        throw new apiError(404, "tweets not exist!")
    }

    res
        .status(200)
        .json(
            new apiResponse(200,
                "All the is fetched successfully.",
                tweet[0])
        )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { newContent } = req.body

    if (!tweetId) {
        throw new apiError(400, "Tweet Id is missing!")
    }
    if (newContent?.trim()==='') {
        throw new apiError(404, "The new Content is empty!")
    }
    const updateTweet = await TweetDB.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: newContent
            }
        },
        {
            new: true
        })
    if (!updateTweet) {
        throw new apiError(404, "Tweet is not exist!")
    }

    res
        .status(200)
        .json(
            new apiResponse(
                200,
                "Tweet is Updated Successfully.",
                updateTweet
            )
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params

    if (!tweetId) {
        throw new apiError(400, "Tweet Id is missing!")
    }

    await TweetDB.findByIdAndDelete(tweetId)

    res
        .status(200)
        .json(
            new apiResponse(
                200,
                "Tweet is Deleted Successfully.",
                []
            )
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
