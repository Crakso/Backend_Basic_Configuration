import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

    },
    fullName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    coverImage: {
        type: String // cloudinary url
    },
    password: {
        type: String,
        require: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    },
    watchHistory: {
        type: Schema.Types.ObjectId,
        ref: "VideoDB"
    }
},
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.method.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.method.generateAccessToken = function () {
    jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        }, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.method.generateRefreshToken = function () {
    jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const UserDB = mongoose.model('UserDB', userSchema);