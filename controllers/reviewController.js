const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.addNewReview = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReivew = new Review(req.body.review);
    newReivew.owner = res.locals.currUser._id;
    listing.reviews.push(newReivew);
    await newReivew.save();
    await listing.save();
    req.session.flash = {
        type: "success",
        message: "Review added successfully",
    };
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req, res) => {
    let { id, reviewID } = req.params;
    await Review.findByIdAndDelete(reviewID);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    req.session.flash = {
        type: "success",
        message: "Review deleted successfully",
    };
    res.redirect(`/listings/${id}`);
};
