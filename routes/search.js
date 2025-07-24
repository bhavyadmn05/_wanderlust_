const express = require("express");
const router = express.Router();
const Listing = require("../models/listing"); // Adjust path based on your model location

// Search Route
router.get("/", async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    const limit = 12;
    const currentPage = Number.isNaN(parseInt(page)) ? 1 : parseInt(page);
    const skip = (currentPage - 1) * limit;

    if (!query || query.trim() === "") {
      req.flash("error", "Please enter a search term");
      return res.redirect("/listings");
    }

    const searchQuery = query.trim();

    // Create search criteria
    const searchCriteria = {
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } },
        { country: { $regex: searchQuery, $options: "i" } },
      ],
    };

    const searchResults = await Listing.find(searchCriteria).skip(skip).limit(limit);
    const totalResults = await Listing.countDocuments(searchCriteria);
    const totalPages = Math.ceil(totalResults / limit);

    let popularListings = [];
    if (searchResults.length === 0) {
      popularListings = await Listing.find({}).limit(8);
    }

    // Safe scoring logic
    const resultsWithScores = searchResults.map((listing) => {
      let matchScore = 0;
      const titleMatch = listing.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const locationMatch = listing.location?.toLowerCase().includes(searchQuery.toLowerCase());

      if (titleMatch) matchScore += 60;
      if (descMatch) matchScore += 30;
      if (locationMatch) matchScore += 40;

      return {
        ...listing.toObject(),
        matchScore: Math.min(matchScore, 100),
      };
    });

    res.render("listings/search", {
      searchResults: resultsWithScores,
      searchQuery,
      currentPage,
      totalPages,
      totalResults,
      popularListings,
      currUser: req.user,
    });
  } catch (error) {
    console.error("Search error:", error.message);
    req.flash("error", `Search failed: ${error.message}`);
    res.redirect("/listings");
  }
});

module.exports = router;
