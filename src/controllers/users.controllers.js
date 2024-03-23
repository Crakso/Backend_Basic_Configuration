import { UserDB } from "../models/users.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js";


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
    const coverImagefilepath = req.files?.coverImage[0]?.path;


    if (!avatarfile) {
        throw new apiError(400, "Avatar File is required!");
    }

    const user = await UserDB.create({
        username: username.toLowerCase(),
        avatar: avatarfilepath,
        email,
        password,
        fullName,
        coverImage: coverImagefilepath?.coverImagefilepath || "",
    })

    const createdUser = await UserDB.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new apiError(500, "Some issue occurs to register a user from server side!");
    }

    res.status(201).json(
       new apiResponse(200, "User is Registered Successfully", createdUser)
    )
})

export { RegisterUser }