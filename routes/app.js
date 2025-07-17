const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/UserModel");
require("dotenv").config();
const secretKey = process.env.secretKey;
const recipeModel = require("../models/FavRecipeModel");

router.get("/", (req, res) => {
  res.send("server running successfully");
});


router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ error: "User Already Exist" });
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return res.status(500).json({ error: "salt password error" });
      }
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return res.status(500).json({ error: "Hashing password error" });
        }
        try {
          let user = await userModel.create({
            username,
            email,
            password: hash,
          });
          const token = jwt.sign({ email }, secretKey);
          res.status(200).json({
            user: user,
            token: token,
            message: "user registered successfully",
          });
        } catch (error) {
          res.status(500).json({ error: "registration error" });
        }
      });
    });
  } catch (error) {
    res.status(400).json({ error: "user signup error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  // console.log(req.header("Authorization")?.split(" ")[1]);
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const LoginUser = await userModel.findOne({ email: email });
    if (!LoginUser) {
      return res.status(400).json({ error: "user not found" });
    }
    const isMatch = await bcrypt.compare(password, LoginUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid user and password" });
    }
    const token = jwt.sign({ email }, secretKey);
    return res
      .status(200)
      .json({ message: "Login successfully", token: token });
  } catch (error) {
    res.status(400).json({ error: "Login error" });
  }
});

// middleware
async function Authmiddleware(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
}
// Authmiddleware();

// route for favrecipe
router.post("/favRecipe", Authmiddleware, async (req, res) => {
  try {
    const useremail = req.user.email;
    const user = await userModel.findOne({ email: useremail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let { name, details, image, } = req.body;
    // console.log(req.body)
    const newFavourite = await recipeModel.create({
      name,
      details,
      image,
      userID: user._id,
    });
    await newFavourite.save();
    await userModel.findByIdAndUpdate(user._id, {
      $push: { favRecipes: newFavourite._id },
    });
    return res.json({ favRecipes: newFavourite });
  } catch (error) {
    res.json({ error: "error during add FavRecipe" });
  }
});

router.get("/fetchAllFavRecipe", Authmiddleware, async (req, res) => {
  try {
    const useremail = req.user.email;
    const user = await userModel.findOne({ email: useremail });
    let id = user._id;
    const recipes = await userModel.findById(id).populate("favRecipes");
    return res.json({
      message: "request successs",
      recipe: recipes.favRecipes,
    });
  } catch (error) {
    return res.json({ error: "error while fetching Favourites" });
  }
});

router.delete("/delete/:id" , async (req , res)=>{
  try {
    const id = req.params.id;
    let response = await recipeModel.findByIdAndDelete(id);
    return res.json({message:response})
    
  } catch (error) {
    return res.json({ error: "error while deleting  Favourites" });
  }
})

module.exports = router;
