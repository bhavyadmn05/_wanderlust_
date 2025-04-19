const Listing = require("./models/listing");
const ExpressError = require("./utils/expressError.js");
const Review = require("./models/review.js");
const {listingSchema , reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        console.log(req.session.redirectUrl);
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login");
    }
    next();  
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;

    }
    else {
        res.locals.redirectUrl = "/listings"; 
    }

    next();
}; 

module.exports.isOwner =  async(req,res,next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("error","You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }
        next();
}

module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    
    if (error){
        let errMsg = error.details.map((el)=>el.message).join(",");

        throw new ExpressError(errMsg,400);
    }
    else{
        next();
    }
};

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
     
    if (error){
        let errMsg = error.details.map((el)=>el.message).join(",");

        throw new ExpressError(errMsg,400);
    }
    else{
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId, id } = req.params; // make sure `id` is destructured
    const review = await Review.findById(reviewId); // Use Review model here

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
