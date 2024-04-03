import { UserDB } from "../models/users.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { subscriberDB } from "../models/subscriptions.model.js";
import mongoose from "mongoose";



const generateUserTokens = async (userId) => {
    try {

        const user = await UserDB.findById(userId)
        // console.log(userId)


        const userAccessToken = user.generateAccessToken()

        const userRefreshToken = user.generateRefreshToken()

        // console.log({userRefreshToken,userAccessToken})

        user.refreshToken = userRefreshToken

        await user.save({ validateBeforeSave: false })

        return { userAccessToken, userRefreshToken }

    } catch (error) {
        throw new apiError(500, "Something went wrong while Generating Tokens!");
    }
}

const RegisterUser = asyncHandler(async (req, res) => {

    //    get user from the frontend.
    //    validation - not empty.
    //    check it if user is already exist: {username || email}
    //    checking also for images check for avatar.
    //    store images into multer. 
    //    if user does not exist then store user into database.
    //    pass the user message and status code for successfully saved.
    //    remove password and refreshToken from response. 
    //    return res


    const { username, email, fullName, password } = req.body;


    if ([username, email, fullName, password].some((field) =>
        field?.trim() === ""
    )) {

        throw new apiError(400, "all fields are required!")
    }

    const userDetail = await UserDB.findOne({
        $or: [{ username }, { email }]
    })

    if (userDetail) {
        throw new apiError(409, "email already exist!")
    }

    const avatarfilepath = req.files?.avatar[0]?.path;
    const coverImagefilepath = req.files?.coverImage[0];
    // console.log(avatarfilepath)

    if (!avatarfilepath) {
        throw new apiError(400, "Avatar File is required!");
    }

    const user = await UserDB.create({
        username: username.toLowerCase(),
        avatar: avatarfilepath,
        email,
        password,
        fullName,
        coverImage: coverImagefilepath?.path || "",
    })

    const createdUser = await UserDB.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new apiError(500, "Some issue occurs to register a user from server side!");
    }

    res.status(201).json(
        new apiResponse(200, "User is Registered Successfully", createdUser)
    )
})

const LogInUser = asyncHandler(async (req, res) => {
    //fetch the data {email, password} from user.
    //check email,password should be not empty.
    //Check if user is valid or not.
    //check password.
    //if user exist then generate tokens.
    //send accesstoken to the user.


    // Fetching Data from User.
    const { username, email, password } = req.body;
    // console.log(username, email);
    if (!username && !email) {
        throw new apiError(404, "username and email is required!");
    }

    //Checking given username and email are valid.
    const isUserValid = await UserDB.findOne({ $or: [{ username }, { email }] });

    if (!isUserValid) {

        throw new apiError(404, "The user is not exist!");
    }

    // Checking Password is Valid or not.
    const isPasswordValid = await isUserValid.isPasswordCorrect(password);

    if (!isPasswordValid) {
        if (!isPasswordValid) {

            throw new apiError(401, "The password is incorrect!");
        }
    }

    const { userAccessToken, userRefreshToken } = await generateUserTokens(isUserValid._id);

    if (!userAccessToken) {
        throw new apiError(500, "Something went wrong! in Server!");
    }

    const LoggedInUser = await UserDB.findOne(isUserValid._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    res
        .status(200)
        .cookie("userDetails", userAccessToken, options)
        .cookie("refreshToken", userRefreshToken, options)
        .json(
            new apiResponse(201, "User is Logged In Successfully",
                {
                    userDetails:
                        userAccessToken,
                    refreshToken: userRefreshToken,
                    LoggedInUser
                })
        )

    // res.status(200).json( new apiResponse(201,"Tokens are Generated Successfully!",tokens.userAccessToken))
})

const LogOutUser = asyncHandler(async (req, res) => {
    // console.log(req.user)
    await UserDB.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie('userDetails', options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User Logged Out"))
})

const UserTokenRefreshing = asyncHandler(async (req, res) => {

    // check is accessToken is expired or not if !accesstoken.
    //get the refresh token from the cookies.
    //check if refresh token is not present then user not login.
    // take the id from the refresh token and find the user and check the refresh token is same in both .
    //if refresh was same then genrete new tokens throw token genration.
    // update the tokens in cookie and database too.

    const RefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!RefreshToken) {
        throw new apiError(401, "Unauthorized Access!")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    try {
        const decoded_jwt = jwt.verify(RefreshToken, process.env.REFRESH_TOKEN_SECRET, options)

        const userData = await UserDB.findById(decoded_jwt._id)

        if (userData?.refreshToken !== RefreshToken) {
            throw new apiError(404, "Refresh Token is expired!")
        }

        const { userAccessToken, userRefreshToken } = await generateUserTokens(decoded_jwt._id)

        res
            .status(200)
            .cookie("userDetails", userAccessToken, options)
            .cookie("refreshToken", userRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    "The Token is Refreshed Successfully!",
                    {
                        userAccessToken,
                        refreshToken: userRefreshToken,
                    }
                )
            )
    } catch (error) {
        throw new apiError(401,
            error?.message || "Invalid Refresh Token")
    }
})

const ChangeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await UserDB.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400, "The password is incorrect!")
    }

    user.password = newPassword

    await user.save({
        validateBeforeSave: false
    })

    res.status(200).json
        (
            new apiResponse(
                200,
                "Password is changed successfully."
            )
        )


})

const GetUserDetails = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                "Current user details fetched successfully",
                req.user)
        )
})

const UpdateUserDetails = asyncHandler(async (req, res) => {
    const { email, fullName, username } = req.body

    if (!email || !fullName || !username) {
        throw new apiError(404, "Email, Fullname and Username are required for Changes!")
    }

    const user = await UserDB.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName: fullName,
                email,
                username
            }
        },
        {
            new: true
        }
    ).select('-password -refreshToken')
    // user.username = username
    // user.fullName = fullName
    // user.email = email
    // user.save(
    //     {
    //         validateBeforeSave: false
    //     }
    // )

    res.status(200).json(new apiResponse(200, "Account Details is Updated Successfully.", user))
})

const UpdateUserAvatar = asyncHandler(async (req, res) => {
    const Avatar = req.file?.path

    const user = await UserDB.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar: Avatar
            }
        },
        {
            new: true
        }).select('-password -refreshToken')

    res.status(200).json(new apiResponse(200, "Avatar is Updated Successfully.", user))
})

const UpdateCoverImage = asyncHandler(async (req, res) => {
    const coverImage = req.file?.path

    const user = await UserDB.findByIdAndUpdate(req.user._id,
        {
            $set: {
                coverImage
            }
        },
        {
            new: true
        }
    ).select('-password -refreshToken')

    res.status(200).json(new apiResponse(200, "Cover Image is Updated Successfully.", user))
})

const getUserChannelDetails = asyncHandler(async (req, res) => {

    const username = req.params
    if (!username) {
        throw new apiError(400, " username is missing!");
    }

    const channel = await UserDB.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriberdbs",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriberdbs",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }

        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                subscribersCount: 1,
                isSubscribed: 1,
                channelSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
            }
        }
    ])

    if (!channel?.length) {
        throw new apiError(404, "Channel does not exist!");
    }

    return res
    .status(200)
    .json(new apiResponse(200,
        "User Channel Fetched Successfully.",
        channel[0]
    ))
})

const getUserWatchHistory = asyncHandler(async(req,res)=>{
    const user = await UserDB.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videosdbs",
                localField: "watchHistory",
                foreignField:"_id",
                as: "WatchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from:"userdbs",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                owner:{
                    $first: "$owner"
                }
            }
        }
    ])
})


export {
    RegisterUser,
    LogInUser,
    LogOutUser,
    UserTokenRefreshing,
    ChangeCurrentPassword,
    GetUserDetails,
    UpdateUserDetails,
    UpdateUserAvatar,
    UpdateCoverImage,
    getUserChannelDetails,
    getUserWatchHistory
}