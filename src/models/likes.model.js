import mongoose , {Schema} from "mongoose";

const likesSchema = new Schema({
    comment:{
        type: Schema.Types.ObjectId,
        ref: "CommentDB"
    },

    video:{
        type: Schema.Types.ObjectId,
        ref: "VideosDB"
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: "UserDB"
    },
    tweets:{
        type: Schema.Types.ObjectId,
        ref: "TweetDB"
    }
},
{
    timestamps: true
})

export const likesDB = mongoose.model("likesDB", likesSchema)