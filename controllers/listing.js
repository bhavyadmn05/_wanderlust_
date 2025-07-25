const Listing = require("../models/listing.js");

module.exports.index = async (req,res)=>{
    const allListings = await Listing.find();
    res.render("./listings/index.ejs",{allListings});
};

module.exports.renderNewForm =  (req,res)=>{
    
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate:{ path:"author"},}).populate("owner");
    if(!listing){
        req.flash("error","listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res, next) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        
        let url = "";
        let filename = "";

        // ✅ Safe check to avoid crash if no file uploaded
        if (req.file) {
            url = req.file.path;
            filename = req.file.filename;
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        await newListing.save();
        req.flash("success", "New listing created successfully!");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};


module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    req.flash("success" , "listing updated");
    if(!listing){
        req.flash("error","listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs",{listing});
};

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success" , "listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res)=>{
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    
    req.flash("success" , "listing deleted");
    res.redirect("/listings"); 
};