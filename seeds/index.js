const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelper");
const Campground = require("../models/campground");

mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
})

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 350; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '67dc23150ac5a28351f5f393', // your user ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tincidunt, nunc vel hendrerit vestibulum, justo elit ullamcorper neque, et ultricies nisl mauris vel velit. Donec vel ipsum vel arcu facilisis sollicitudin. Integer at erat sed risus vulputate gravida. Vestibulum non velit vel nisi consectetur condimentum. Nulla facilisi. Donec vitae velit non ex scelerisque dignissim. Maecenas tristique",
            price,
            geometry: {
                    type: 'Point',
                    coordinates: [
                        cities[random1000].longitude,
                        cities[random1000].latitude
                    ],
                },
                image: [
                    {
                        url: 'https://res.cloudinary.com/dhpemm559/image/upload/v1743520815/YelpCamp/u7wcqhkbqkwg9ds3unec.png',
                        filename: 'YelpCamp/u7wcqhkbqkwg9ds3unec',
                    },
                    {
                        url: 'https://res.cloudinary.com/dhpemm559/image/upload/v1743688789/YelpCamp/tuxpcyd7ot7xthk0ppbm.png',
                        filename: 'YelpCamp/tuxpcyd7ot7xthk0ppbm',
                    },
                    {
                        url: 'https://res.cloudinary.com/dhpemm559/image/upload/v1743688785/YelpCamp/hrd4qh2rs0q3fr53y5o2.jpg',
                        filename: 'YelpCamp/hrd4qh2rs0q3fr53y5o2',
                    },
                    {
                        url: 'https://res.cloudinary.com/dhpemm559/image/upload/v1743688787/YelpCamp/kiej23rxdawbodgfquk8.png',
                        filename: 'YelpCamp/kiej23rxdawbodgfquk8',
                    },
                ],
            })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})