if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");  

const db_url = process.env.ATLASTDB_URL;


main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(db_url);
}

app.set("views engine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl:db_url,
    crypto:{
        secret:process.env.SECRETS,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("Error in mongo session store",err);
});

const sessionOptions = {
    store,
    secret:process.env.SECRETS, // ✅ corrected typo here
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((err, req, res, next) => {
    console.error(err.stack);
    req.flash("error", err.message);
    res.redirect("/listings");
});


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next(); 
});


app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/", userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});
    
app.use((err,req,res,next)=>{
    let{statusCode=500,message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{err});
    
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});