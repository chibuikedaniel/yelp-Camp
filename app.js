if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session")
const flash = require("connect-flash")
const { campgroundSchema, reviewSchema } = require("./validation/schema")
const methodOverride = require("method-override")
const mongoose = require("mongoose");
const catchAsync = require("./utils/catchAsync")
const expressError = require("./utils/expressError");
const Campground = require("./models/campground");
const Review = require("./models/review")
const { title } = require("process");
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelpCamp';
const secret = process.env.SECRET || 'my secret';

const userRoutes = require("./routes/user")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")

// mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp');
mongoose.connect(dbUrl)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
})

const app = express();
const port = 3000;

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

app.use(express.static(path.join(__dirname,"public")))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"));
app.use(mongoSanitize())

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on("error", function (e) {
    console.log("Session store error", e);
});

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, // Uncomment this line to use secure cookies in production
        // secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(flash())
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/", 
];
const fontSrcUrls = []
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [""],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            fontSrc: ["'self'", ...fontSrcUrls],
            imgSrc: ["'self'",
                "data:",
                "blob:",
                "https://images.unsplash.com/",
                "https://res.cloudinary.com/dhpemm559/",
                "https://api.maptiler.com/",
            ],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

app.get("/", (req, res) => {
    res.render("home");
})

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)






app.all("*", (req, res, next) => {
    next(new expressError("page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message("Something went wrong")
    res.status(statusCode).render("error", { err })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})