import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}


const deleteOnCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl) return null;
        // delete the file on cloudinary
        const publicId = fileUrl.split('/').pop().split('.')[0];
        const response = await cloudinary.uploader.destroy(publicId)
        return response;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export { uploadOnCloudinary, deleteOnCloudinary }
