const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const {
    getSignupForm,
    postSignup,
    getLoginForm,
    postLogin,
    logoutRoute,
} = require("../controllers/userController");

//Signup Route
router.route("/signup").get(getSignupForm).post(wrapAsync(postSignup));

//Login Route
router
    .route("/login")
    .get(getLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        wrapAsync(postLogin)
    );

//Logout route
router.get("/logout", logoutRoute);

module.exports = router;
