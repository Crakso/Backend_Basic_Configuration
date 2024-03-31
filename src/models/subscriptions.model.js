import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    
    subscriber :{
        type: Schema.Types.ObjectId,
        ref: "UserDB" 
    },

    channel:{
        type: Schema.Types.ObjectId,
        ref: "UserDB"
    }

},
{
    timestamps: true
})

export const subscriberDB = mongoose.model("subscriberDB", subscriptionSchema)