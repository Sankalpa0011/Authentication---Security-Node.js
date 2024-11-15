require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
//const bcryptjs = require("bcryptjs");
//const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app = express();



app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/userDB")
   .then(() => console.log("Connected to MongoDB successfully"))
   .catch((err) => console.log(err));



// Create a new user schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Add passport-local-mongoose to userSchema 
userSchema.plugin(passportLocalMongoose);  // hash and salt passwords and to save users into MongoDB database

 
// secret key for encryption
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

// create a new user model
const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", async (req, res) => {
    res.render("home");
});




app.get("/login", async (req, res) => {
    res.render("login");
});




app.get("/register", async (req, res) => {
    res.render("register"); 
});



app.get("/secrets", async (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});



app.get("/logout", async (req, res, next) => {
    try {
        await new Promise((resolve, reject) => {
            req.logout((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        res.redirect("/");
    } catch (err) {
        next(err);
    }
});





// HASHING

// app.post("/register", async (req, res) => {
//     try {
//         const newUser = new User({
//             email: req.body.username,
//             password: md5(req.body.password)
//         });
//         await newUser.save()
//         if (newUser.save()) {
//             res.render("secrets");
//             console.log("User saved successfully");
//         } else {
//             res.send("Error saving user");
//             console.log("Error saving user");
//         }
//     } catch (err) {
//         console.log(err);
//     }
// });



// app.post("/login", async (req, res) => {
//     const username = req.body.username;
//     const password = md5(req.body.password);
//     try {
//         const foundUser = await User.findOne({email: username});
//         if (foundUser) {
//             if (foundUser.password === password) {
//                 res.render("secrets");
//                 console.log("User found");
//             } else {
//                 res.send("Invalid username or password");
//                 console.log("Invalid username or password");
//             }
//         } else {
//             res.send("User not found");
//             console.log("User not found");
//         }
//     } catch (err) {
//         console.error("Error occurred during login:", err);
//         res.status.send("Error occurred during login");
//     }
// });




// HASHING AND SALTING

// app.post("/register", async (req, res) => {
//     try {
//         const hashedPassword = await bcryptjs.hash(req.body.password, saltRounds);
//         const newUser = new User({
//             email: req.body.username,
//             password: hashedPassword
//         });
//         await newUser.save()
//         if (newUser.save()) {
//             res.render("secrets");
//             console.log("User saved successfully");
//         } else {
//             res.send("Error saving user");
//             console.log("Error saving user");
//         }
//     } catch (err) {
//         console.log(err);
//     }
// });



// app.post("/login", async (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;
//     try {
//         const foundUser = await User.findOne({email: username});
//         if (foundUser) {
//             const isMatch = await bcryptjs.compare(password, foundUser.password);
//             if (isMatch) {
//                 res.render("secrets");
//                 console.log("User found");
//             } else {
//                 res.send("Invalid username or password");
//                 console.log("Invalid username or password");
//             }
//         } else {
//             res.send("User not found");
//             console.log("User not found");
//         }
//     } catch (err) {
//         console.error("Error occurred during login:", err);
//         res.status.send("Error occurred during login");
//     }
// });




// ADD COCKIES AND SESSIONS WITH PASSPORT AUTHENTICATION AND AUTHORIZATION 

app.post("/register", async (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");	
            });
        }
    });
});



app.post("/login", async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});