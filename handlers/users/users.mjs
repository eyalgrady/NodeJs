import mongoose from "mongoose";
import { app } from "../../app.mjs";
import { adminGuard, getUser, guard, roleGuard } from "../../guard.mjs";
import { UserLogin, UserSignup } from "./users.joi.mjs";
import { User } from "./users.model.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// register user
app.post("/users", async (req, res) => {
  const validate = UserSignup.validate(req.body, { allowUnknown: true });

  if (validate.error) {
    return res.status(403).send(validate.error.details[0].message);
  }

  if (await User.findOne({ email: req.body.email })) {
    return res.status(403).send("Email already exists");
  }

  const item = req.body;
  const user = new User({
    name: {
      first: item.first,
      middle: item.middle,
      last: item.last,
    },
    phone: item.phone,
    email: item.email,
    password: await bcrypt.hash(item.password, 10),
    address: {
      state: item.address.state,
      country: item.address.country,
      city: item.address.city,
      street: item.address.street,
      houseNamber: item.address.houseNamber,
    },
    image: {
      url: item.image.url,
      alt: item.image.alt,
    },
    isBusiness: item.isBusiness,
    isAdmin: item.isAdmin,
  });

  const newUser = await user.save();
  res.send(newUser);
});

// login
app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  const validate = UserLogin.validate({ email, password });

  if (validate.error) {
    return res.status(403).send(validate.error.details[0].message);
  }

  const user = await User.findOne({ email, isDeleted: { $ne: true } });

  if (!user) {
    return res.status(403).send("Invalid email or password");
  }

  if (!user.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(403).send("Invalid email or password");
  }

  const token = jwt.sign(
    {
      _id: user._id,
      isBusiness: user.isBusiness,
      isAdmin: user.isAdmin,
      iat: new Date().getTime() / 1000,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.send(token);
});

// Get all users
app.get("/users", guard, adminGuard, async (req, res) => {
  res.send(await User.find({ isDeleted: { $ne: true } }));
});

// Get user
app.get("/users/:id", guard, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid user ID");
  }

  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).send("User not found");

  if (getUser(req).isAdmin || user._id == getUser(req)._id) {
    res.send(user);
  } else {
    res.status(401).send("User is not authorized");
  }
});

// Edit user
app.put("/users/:id", guard, async (req, res) => {
  const userId = req.params.id;
  const item = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).send("Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).send("User not found");
  }

  const currentUser = getUser(req);
  if (user._id.equals(currentUser._id) || currentUser.isAdmin) {
    const validate = UserSignup.validate(req.body, { allowUnknown: true });

    if (validate.error) {
      return res.status(403).send(validate.error.details[0].message);
    }

    if (await User.findOne({ email: req.body.email })) {
      return res.status(403).send("Email already exists");
    }

    user.name.first = item.name.first;
    user.name.middle = item.name.middle;
    user.name.last = item.name.last;
    user.phone = item.phone;
    user.email = item.email;
    user.password = item.password
      ? await bcrypt.hash(item.password, 10)
      : user.password;
    user.address.state = item.address.state;
    user.address.country = item.address.country;
    user.address.city = item.address.city;
    user.address.street = item.address.street;
    user.address.houseNumber = item.address.houseNamber;
    user.image.url = item.image?.url || user.image.url;
    user.image.alt = item.image?.alt || user.image.alt;

    await user.save();
    res.send(user);
  } else {
    res.status(401).send("User is not authorized");
  }
});

// Change isBusiness status
app.patch("/users/:id", guard, async (req, res) => {
  const userId = req.params.id;
  const item = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).send("Invalid user ID");
  }

  const user = await User.findById(userId);
  const currentUser = getUser(req);

  if (!user) {
    return res.status(403).send({ message: "User not found" });
  }

  if (user._id.equals(currentUser._id) || currentUser.isAdmin) {
    user.isBusiness = item.isBusiness;
    await user.save();
    res.send(user);
  } else {
    res.status(401).send("User is not authorized");
  }
});

// Delete user
app.delete("/users/:id", guard, async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).send("Invalid user ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  if (getUser(req).isAdmin || user._id == getUser(req)._id) {
    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.send({ message: "User deleted successfully" });
    res.end();
  } else {
    res.status(401).send("User is not authorized");
  }
});
