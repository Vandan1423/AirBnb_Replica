const Listing = require("../models/listing");
const pluralize = require("pluralize");
const { allCategories } = require("../categoryData");

function normalizeCategory(word) {
    let lower = word.toLowerCase();
    let plural = pluralize(lower);
    let capitalized = plural.charAt(0).toUpperCase() + plural.slice(1);
    return capitalized;
}

module.exports.searchResults = async (req, res) => {
    let { searchRes } = req.query;
    let searchResArr = searchRes.split(" ").filter(Boolean);
    let orConditions = [];
    for (word of searchResArr) {
        orConditions.push(
            { title: { $regex: word, $options: "i" } },
            { description: { $regex: word, $options: "i" } },
            { location: { $regex: word, $options: "i" } },
            { country: { $regex: word, $options: "i" } },
            { categories: normalizeCategory(word) }
        );
    }
    let allListings = await Listing.find({
        $or: orConditions,
    });
    res.render("listing/index.ejs", {
        allListings,
        allCategories,
    });
};
