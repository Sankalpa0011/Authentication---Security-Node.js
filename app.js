require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/userDB")
   .then(() => console.log("Connected to MongoDB successfully!"))
   .catch((err) => console.log(err));


// Create a new user schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// secret key
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

// create a new user model
const User = new mongoose.model("User", userSchema);

app.get("/", async (req, res) => {
    res.render("home");
});


app.get("/login", async (req, res) => {
    res.render("login");
});


app.get("/register", async (req, res) => {
    res.render("register"); 
});

app.post("/register", async (req, res) => {
    try {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });
        await newUser.save()
        if (newUser.save()) {
            res.render("secrets");
            console.log("User saved successfully");
        } else {
            res.send("Error saving user");
            console.log("Error saving user");
        }
    } catch (err) {
        console.log(err);
    }
});


app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const foundUser = await User.findOne({email: username});
        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
                console.log("User found");
            } else {
                res.send("Invalid username or password");
                console.log("Invalid username or password");
            }
        } else {
            res.send("User not found");
            console.log("User not found");
        }
    } catch (err) {
        console.error("Error occurred during login:", err);
        res.status.send("Error occurred during login");
    }
});






app.listen(3000, () => {
    console.log("Server is running on port 3000");
});