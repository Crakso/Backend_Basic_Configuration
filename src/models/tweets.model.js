import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
    content: {
        type: String,
    },
    
    owner: {
        type: Schema.Types.ObjectId,
        ref: "UserDB"
    }
},
    {
        timestamps: true
    })

export const TweetDB = mongoose.model("TweetDB", tweetSchema)