const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//Accessing the cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Check if cloudinary credentials are set
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
    console.error("WARNING: Cloudinary credentials are missing in .env file!");
    console.error("Please add: CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET");
}

//Creating a storage (Folder)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "airBnb_DEV",
        allowedFormats: ["png", "jpg", "jpeg"],
    },
});

module.exports = { cloudinary, storage };
