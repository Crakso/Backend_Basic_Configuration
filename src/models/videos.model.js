import mongoose, { Schema } from 'mongoose'

const videoSchema = new Schema({

    videoFile: {    
        type: String,               //cloudnary url
        required: true
    },
    thumbnail: {                    //cloudnary url
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "UserDB"
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    }
)


export const VideosDB = mongoose.model('VideosDB', videoSchema);