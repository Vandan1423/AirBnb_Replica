// Environment Configuration
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
const serverless = require("serverless-http"); // For serverless deployment

const ExpressError = require("./utils/ExpressError");
const User = require("./models/users");

// Route Imports
const reviewRoute = require("./routes/reviewRoute");
const userRoute = require("./routes/userRoute");
const listingRoute = require("./routes/listingRoute");

// App Initialization
const app = express();
const PORT = process.env.PORT || 4000;
const DBURL = process.env.ATLASDB_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/airbnb_replica";

// MongoDB Connection
async function main() {
  try {
    await mongoose.connect(DBURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
main();

// Session Store Configuration
const store = MongoStore.create({
  mongoUrl: DBURL,
  crypto: { secret: process.env.SECRET || "defaultsecret" },
  touchAfter: 24 * 3600, // seconds
});

store.on("error", (err) => {
  console.log("Error in Mongo Store:", err);
});

// Cookie expiry fix: use Date.now() + ms
const oneWeekMs = 1000 * 60 * 60 * 24 * 7; // 7 days
const sessionOptions = {
  store,
  secret: process.env.SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + oneWeekMs),
    maxAge: oneWeekMs,
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
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

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

// --- Export / Listen logic ---
// For local dev: start the server with `node index.js`
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

// For Vercel (production) export serverless handler
module.exports = app;
module.exports.handler = serverless(app);
