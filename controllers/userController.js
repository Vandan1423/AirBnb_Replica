const User = require("../models/users");
const { allCategories } = require("../categoryData");

module.exports.getSignupForm = (req, res) => {
    res.render("users/signup.ejs", { allCategories, selectedCategory: null });
};

module.exports.postSignup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ email, username });
        let registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                next();
            } else {
                req.session.flash = {
                    type: "success",
                    message: "Welcome to AirBnb_Replica",
                };
                res.redirect("/listings");
            }
        });
    } catch (err) {
        req.session.flash = {
            type: "error",
            message: err.message,
        };
        res.redirect("/signup");
    }
};

module.exports.getLoginForm = (req, res) => {
    res.render("users/login.ejs", { allCategories, selectedCategory: null });
};

module.exports.postLogin = async (req, res) => {
    req.session.flash = {
        type: "success",
        message: "You logged in successfully",
    };
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logoutRoute = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            next(err);
        }
        req.session.flash = {
            type: "success",
            message: "You are logged out",
        };
        res.redirect("/listings");
    });
};
