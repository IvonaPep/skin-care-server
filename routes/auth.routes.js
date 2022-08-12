const router = require("express").Router();
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { isAuthenticated } = require("../middleware/jwt.middleware");

const saltRounds = 10;

const User = require("../models/User.model");

// router.get("/loggedin", (req, res) => {
//   res.json(req.user);
// });

router.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ errorMessage: "Please provide a username." });
  }

  if (password.length < 8) {
    return res.status(400).json({
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  User.findOne({ username })
    .then((found) => {
      if (found) {
        return res
          .status(400)
          .json({
            errorMessage: "Username already taken. Please choose another.",
          });
      }

      return bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) => {
          return User.create({
            username,
            password: hashedPassword,
          });
        });
    })
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ errorMessage: error.message });
      }
      if (error.code === 11000) {
        return res.status(400).json({
          errorMessage:
            "Username need to be unique. The username you chose is already taken.",
        });
      }
      return res.status(500).json({ errorMessage: error.message });
    });
});

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide your username." });
  }

  if (password.length < 8) {
    return res.status(400).json({
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .json({ errorMessage: "Wrong username. Please try again." });
      }

      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res
            .status(400)
            .json({ errorMessage: "Wrong password. Please try again." });
        }

        const { _id, username } = user;

        // Create an object that will be set as the token payload
        const payload = { _id, username };

        // Create and sign the token
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get('/verify', isAuthenticated, (req, res, next) => {       // <== CREATE NEW ROUTE
 
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log(`req.payload`, req.payload);
 
  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});

module.exports = router;
