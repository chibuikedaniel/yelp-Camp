const express = require("express")
const router = express.Router()
const campground = require("../controllers/campgrounds")
const catchAsync = require("../utils/catchAsync")
const Campground = require("../models/campground")
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware")
const multer = require("multer")
const { storage } = require("../cloudinary")
const uplodes = multer({ storage })




// router.get("/", (req, res) => {
//     res.render("home");
// })

router.route("/")
    .get(catchAsync(campground.index))
    .post(isLoggedIn, uplodes.array("image"), validateCampground, catchAsync(campground.createCampground));

router.get("/new", isLoggedIn, campground.renderNewForm)

router.route("/:id")
    .get(catchAsync(campground.showCampground))
    .put(isLoggedIn, isAuthor, uplodes.array("image"), validateCampground, catchAsync(campground.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campground.renderEditForm));


module.exports = router;