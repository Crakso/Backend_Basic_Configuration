import mongoose , {Schema} from 'mongoose'


const PlaylistSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    description:{
        type: String
    },

    videos:{
        type: Schema.Types.ObjectId,
        ref: "VideosDB"
    },

    owner:{
        type: Schema.Types.ObjectId,
        ref: "UserDB"
    }
},
{
    timestamps: true
}
)

export const playlistDB = mongoose.model("playlistDB", PlaylistSchema)