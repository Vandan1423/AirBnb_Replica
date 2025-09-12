const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
    .then(() => {
        console.log("Succesfully Connected to mongodb");
    })
    .catch((err) => {
        throw err;
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/airbnb_replica");
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((ele) => {
        return { ...ele, owner: "68becdd2599968e122788f8c" };
    });
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();
