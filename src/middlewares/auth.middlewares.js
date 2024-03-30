import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { UserDB } from '../models/users.model.js';


// _ is use when we not using any request/response so we can replace that with _.
const userAuthentication = asyncHandler(async (req, _, next) => {

    try {
        const userAccessToken = req.cookies?.userDetails || req.header("Authorization")?.replace("Bearer ", "")

        if (!userAccessToken) {

            throw new apiError(401, "Unauthorized request")
        }

        const verifiedToken = jwt.verify(userAccessToken, process.env.ACCESS_TOKEN_SECRET)


        const userData = await UserDB.findById(verifiedToken._id).select("-password -refreshToken")

        if (!userData) {
            throw new apiError(401, "Invalid Access Token!")
        }
        req.user = userData;

        next()

    } catch (error) {
        console.log(error)
        throw new apiError(401, "Invalid Access Token")
    }
})

export { userAuthentication}