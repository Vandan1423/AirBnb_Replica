if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const port = 4000;
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const reviewRoute = require("./routes/reviewRoute");
const userRoute = require("./routes/userRoute");
const listingRoute = require("./routes/listingRoute");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users");
const flash = require("connect-flash");

const DBURL = process.env.ATLASDB_URL;

//Connect to mongoDB
main()
    .then(() => {
        console.log("Succesfully Connected to mongodb");
    })
    .catch((err) => {
        throw err;
    });
async function main() {
    await mongoose.connect(DBURL);
}

//Creating a mongoStore
const store = MongoStore.create({
    mongoUrl: DBURL,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600, //Time for which we have to store session data
});

store.on("error", (err) => {
    console.log("Error in mongo store");
    console.log(err);
});

//Using sessions
let sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expire: Date.now() * 1000 * 3600 * 24 * 7, //7 days
        maxAge: 1000 * 3600 * 24 * 7,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));

//ConnectFlash (Using this only becuase passport support this)
app.use(flash());

//Using passport for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Defining Locals
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.currPath = req.path;
    next();
});

//Custom Flash middleware
app.use((req, res, next) => {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

//Use Ejs as view engine and views folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine("ejs", ejsMate);

//Set the path for static files and use other methods
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(
    "/bootstrap",
    express.static(path.join(process.cwd(), "node_modules/bootstrap/dist"))
);

//Router routes
app.use("/listings", listingRoute);
app.use("/listings/:id/reviews", reviewRoute);
app.use("/", userRoute);

//Error handler for non-valid routes
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
});
//Main error Handler
app.use((err, req, res, next) => {
    //For errors when mongoDB cannot find ID in databasae
    if (err.name === "CastError") {
        req.session.flash = {
            type: "error",
            message: "Listing does not exist",
        };
        return res.redirect("/listings");
    }

    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

//Listen the port
app.listen(port, () => {
    console.log(`Listening to port 4000`);
});
