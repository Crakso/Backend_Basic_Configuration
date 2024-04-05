import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String,
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "VideoDB"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "UserDB"
    }
},
    {
        timestamps: true
    })

export const CommentDB = mongoose.model("CommentDB", commentSchema)