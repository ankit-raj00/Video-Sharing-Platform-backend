import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"  // file system node js

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {

        if(!localFilePath) return null 
        //upload the file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type : "auto"
        })
        //file has been uploaded sucessfully
        //console.log('file is uploaded sucessfully' , response.url);
        fs.unlinkSync(localFilePath);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed

        return null;
    }
}

const deleteFromCloudinary = async (fileUrl) => {
    try {
        // Extract the public ID and resource type from the URL
        const urlParts = fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1]; // Get the last part (e.g., t8ol3pdanrp1t4fffpxn.mp4 or hpvu8pg7rw50v7wj61ih.png)
        const publicId = fileName.split('.')[0]; // Remove the extension (e.g., .mp4 or .png)

        // Determine the resource type based on the URL
        const isVideo = fileUrl.includes('/video/');
        const resourceType = isVideo ? 'video' : 'image';

        // Delete the file from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return response;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };

