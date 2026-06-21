const express = require("express");
const passport = require("passport");
const User = require("../model/UsersModel");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

if (!usernameRegex.test(req.body.username)) {
  return res.status(400).json({
    error:
      "Username must be at least 6 characters and include letters and numbers",
  });
}

  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
    });

    const registeredUser = await User.register(
      user,
      req.body.password
    );

    req.login(registeredUser, () => {
      res.json({ user: registeredUser });
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: "Password or username is incorrect" });
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ user: req.user });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  res.json({ user: req.user });
});

router.get("/check-username", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ available: false });
    }

    const existingUser = await User.findOne({ username });

    res.json({ available: !existingUser });
  } catch (err) {
    res.status(500).json({ available: false });
  }
});

module.exports = router;