const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema } = require("./Schema.js");
const ExpressError = require("./utils/ExpressError");
const { reviewSchema } = require("./Schema");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.session.flash = {
            type: "error",
            message: "Please login to proceed",
        };
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.session.flash = {
            type: "error",
            message: "You are not the owner",
        };
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//Middleware for handling the validations
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(
            404,
            error.details.map((el) => el.message).join(",")
        );
    } else {
        next();
    }
};

//Middleware to check the validations
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(
            400,
            error.details.map((el) => el.message).join(",")
        );
    } else {
        next();
    }
};

module.exports.isReviewOwner = async (req, res, next) => {
    let { id, reviewID } = req.params;
    let review = await Review.findById(reviewID);
    if (!review.owner.equals(res.locals.currUser._id)) {
        req.session.flash = {
            type: "error",
            message: "You are not the owner of review",
        };
        return res.redirect(`/listings/${id}`);
    }
    next();
};
