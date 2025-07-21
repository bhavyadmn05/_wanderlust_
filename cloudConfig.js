const cloudinary = require("cloudinary").v2;
const{cloudinaryStorage, CloudinaryStorage} =require("multer-storage-cloudinary");
const { param } = require("./routes/listings");

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_sectret:process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"wanderlust_DEV",
        allowedFormats:["png","jpg","jpeg","gif"],
    },
});

module.exports = {
    cloudinary,
    storage,
};

