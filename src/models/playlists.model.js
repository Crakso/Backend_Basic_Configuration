import mongoose , {Schema} from 'mongoose'


const PlaylistSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    description:{
        type: String
    }
})

export const playlistDB = mongoose.model("playlistDB", PlaylistSchema)