//Environment Configuration
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Required Modules
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/users");

// Route Imports
const reviewRoute = require("./routes/reviewRoute");
const userRoute = require("./routes/userRoute");
const listingRoute = require("./routes/listingRoute");

// App Initialization
const app = express();
const port = 4000;
const DBURL = process.env.ATLASDB_URL;

// MongoDB Connection
async function main() {
    await mongoose.connect(DBURL);
}
main()
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => {
        throw err;
    });

// Session Store Configuration
const store = MongoStore.create({
    mongoUrl: DBURL,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600, // session data stored for 24 hours
});

store.on("error", (err) => {
    console.log("Error in Mongo Store:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expire: Date.now() * 1000 * 3600 * 24 * 7, // 7 days
        maxAge: 1000 * 3600 * 24 * 7,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));

// Flash Messages
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.currPath = req.path;
    next();
});

// Custom Flash Middleware
app.use((req, res, next) => {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

// View Engine Configuration
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Static & Middleware Setup
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(
    "/bootstrap",
    express.static(path.join(process.cwd(), "node_modules/bootstrap/dist"))
);

// Routes
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingRoute);
app.use("/listings/:id/reviews", reviewRoute);
app.use("/", userRoute);

// Error Handling

// 404 Handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Main Error Handler
app.use((err, req, res, next) => {
    if (err.name === "CastError") {
        req.session.flash = {
            type: "error",
            message: "Listing does not exist",
        };
        return res.redirect("/listings");
    }

    const { statusCode = 500 } = err;
    res.status(statusCode).render("error.ejs", { err });
});

// Server Listener
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
