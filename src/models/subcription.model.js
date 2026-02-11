import mongoose from "mongoose";

const subcriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

export default mongoose.model("Subcription", subcriptionSchema)