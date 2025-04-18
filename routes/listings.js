const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");

router.get("/" , wrapAsync(listingController.index));

router.get("/new" , isLoggedIn,listingController.renderNewForm);

router.get("/:id" , wrapAsync(listingController.showListing));

router.post("/" , isLoggedIn, validateListing ,wrapAsync(listingController.createListing));
 
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

router.put("/:id" , isLoggedIn , isOwner , validateListing, wrapAsync(listingController.updateListing));

router.delete("/:id" , isLoggedIn , isOwner ,wrapAsync(listingController.deleteListing));

module.exports = router;
