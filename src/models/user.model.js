import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // it will good for searching in database
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    avatar: {
        type: String, //Cloudinary
        default: ""
    },
    coverImage: {
        type: String, //Cloudinary
        default: ""
    },
    refreshToken: {
        type: String,
        default: ""
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ]

}, {
    timestamps: true // it will good for tracking the creation and update time
})


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id,
        userName: this.userName,
        email: this.email,
        fullName: this.fullName,

    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        id: this._id,

    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOEKN_EXPIRY })
}

const User = mongoose.model("User", userSchema)
export default User