const Listing = require("../models/listing");
const { allCategories } = require("../categoryData");

module.exports.index = async (req, res) => {
    let selectedCategory = req.query.category;
    let allListings;
    const validCategories = allCategories.map((cat) => cat.name);
    
    if (!selectedCategory || !validCategories.includes(selectedCategory)) {
        allListings = await Listing.find({});
        selectedCategory = null;
    } else {
        allListings = await Listing.find({
            categories: { $in: [selectedCategory] },
        });
    }
    
    res.render("listing/index.ejs", {
        allListings,
        allCategories,
        selectedCategory,
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listing/new.ejs", { allCategories, selectedCategory: null });
};

module.exports.postNewListing = async (req, res) => {
    if (!req.file) {
        req.session.flash = { type: "error", message: "Please upload an image" };
        return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // Handle categories - ensure it's an array
    if (req.body.listing.categories) {
        if (typeof req.body.listing.categories === 'string') {
            newListing.categories = [req.body.listing.categories];
        } else {
            newListing.categories = req.body.listing.categories;
        }
    } else {
        newListing.categories = ["Others"];
    }

    await newListing.save();
    req.session.flash = { type: "success", message: "New listing added" };
    res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "owner",
            },
        })
        .populate("owner");

    if (!listing) {
        req.session.flash = {
            type: "error",
            message: "Listing does not exist",
        };
        return res.redirect("/listings");
    }

    res.render("listing/show.ejs", { listing, allCategories, selectedCategory: null });
};

module.exports.editListingForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listing/edit.ejs", { listing, allCategories, selectedCategory: null });
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    let currentListing = await Listing.findById(id);
    
    // Prepare update data - preserve categories from existing listing
    let updateData = {
        ...req.body.listing,
        categories: currentListing.categories // Preserve existing categories
    };
    
    let listing = await Listing.findByIdAndUpdate(id, updateData, { new: true });
    
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    
    req.session.flash = {
        type: "success",
        message: "Listing was updated successfully",
    };
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.session.flash = {
        type: "success",
        message: "Listing deleted successfully",
    };
    res.redirect("/listings");
};