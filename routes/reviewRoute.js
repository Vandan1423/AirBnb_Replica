const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateReview, isReviewOwner } = require("../middleware");
const {
    addNewReview,
    deleteReview,
} = require("../controllers/reviewController");

//Add a new comment
router.post("/", validateReview, isLoggedIn, wrapAsync(addNewReview));

//Delete a comment
router.delete("/:reviewID", isLoggedIn, isReviewOwner, wrapAsync(deleteReview));

module.exports = router;
