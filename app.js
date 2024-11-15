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
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");



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
    password: String,
    googleId: String, // for google OAuth
    secret: String
});


// Add passport-local-mongoose to userSchema 
userSchema.plugin(passportLocalMongoose);  // hash and salt passwords and to save users into MongoDB database
userSchema.plugin(findOrCreate);
 

// secret key for encryption
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});


// create a new user model
const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser( (user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


// OAuth - OPEN AUTHORIZATION - GOOGLE OAuth 2.0 AUTHENTICATION STRATEGY 
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


// Routes 

app.get("/", async (req, res) => {
    res.render("home");
});



app.get("/auth/google", 
    passport.authenticate("google", {scope: ["profile"]})
);
app.get("/auth/google/secrets", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
      // Successful authentication, redirect to secrets.
      res.redirect("/secrets");
    });



app.get("/login", async (req, res) => {
    res.render("login");
});



app.get("/register", async (req, res) => {
    res.render("register"); 
});



app.get("/secrets", async (req, res) => {
    try {
        const foundUsers = await User.find({"secret": {$ne: null}});
        if (foundUsers) {
            res.render("secrets", {usersWithSecrets: foundUsers});
        }
    } catch (err) {
        console.log(err);
    }
});


app.get("/submit", async (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/login");
    }
});

app.post("/submit", async (req, res) => {
    const submittedSecret = req.body.secret;
    console.log(req.user.id);
    try {
        const foundUser = await User.findById(req.user.id);
        foundUser.secret = submittedSecret;
        await foundUser.save();
        console.log("Secret submitted successfully");
        res.redirect("/secrets");
    } catch (err) {
        console.log(err);
        res.send("Error submitting secret");
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