const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const {
    index,
    renderNewForm,
    postNewListing,
    showListing,
    editListingForm,
    editListing,
    deleteListing,
} = require("../controllers/listingsController");
const { searchResults } = require("../controllers/searchController");
const multer = require("multer");
const { storage } = require("../couldConfig");
const upload = multer({ storage });

//Index Route
router
    .route("/")
    .get(wrapAsync(index))
    .post(
        validateListing,
        isLoggedIn,
        upload.single("listing[image]"),
        wrapAsync(postNewListing)
    );

//Create new listing form
router.get("/new", isLoggedIn, renderNewForm);

//Handle Search Results
router.get("/search", searchResults);

//Show Route
router
    .route("/:id")
    .get(wrapAsync(showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(editListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(deleteListing));

//Edit form for a particular listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(editListingForm));

module.exports = router;
