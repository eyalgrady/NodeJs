import mongoose from "mongoose";
import { app } from "../../app.mjs";
import { getUser, guard, roleGuard } from "../../guard.mjs";
import { CardValid } from "./cards.joi.mjs";
import { Card } from "./cards.model.mjs";

// All cards
app.get("/cards", async (req, res) => {
  res.send(await Card.find({ isDeleted: { $ne: true } }));
});

// Get user cards
app.get("/cards/my-cards", guard, async (req, res) => {
  const user = getUser(req);
  res.send(await Card.find({ user_id: user._id, isDeleted: { $ne: true } }));
});

// Get card
app.get("/cards/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid card ID");
  }
  const card = await Card.findById(req.params.id);
  if (!card) {
    return res.status(404).send("Card not found");
  }
  res.send(await Card.findById(req.params.id));
});

// Create new card
app.post("/cards", guard, roleGuard, async (req, res) => {
  const validate = CardValid.validate(req.body, { allowUnknown: true });

  if (validate.error) {
    return res.status(403).send(validate.error.details[0].message);
  }

  const item = req.body;
  const card = new Card({
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    phone: item.phone,
    email: item.email,
    web: item.web,
    image: {
      url: item.image.url,
      alt: item.image.alt,
    },
    address: {
      state: item.address.state,
      country: item.address.country,
      city: item.address.city,
      street: item.address.street,
      houseNamber: item.address.houseNamber,
      zip: item.address.zip,
    },
    user_id: getUser(req)?._id,
  });

  const newCard = await card.save();
  res.send(newCard);
});

// Edit card
app.put("/cards/:id", guard, async (req, res) => {
  const user = getUser(req);
  const cardId = req.params.id;
  const item = req.body;

  if (!mongoose.isValidObjectId(cardId)) {
    return res.status(400).send("Invalid card ID");
  }

  const card = await Card.findById(cardId);

  if (!card) {
    return res.status(404).send({ message: "Card not found" });
  }

  if (getUser(req).isAdmin || user._id == card.user_id) {
    const validate = CardValid.validate(req.body, { allowUnknown: true });

    if (validate.error) {
      return res.status(403).send(validate.error.details[0].message);
    }

    card.title = item.title || card.title;
    card.subtitle = item.subtitle || card.subtitle;
    card.description = item.description || card.description;
    card.phone = item.phone || card.phone;
    card.email = item.email || card.email;
    card.web = item.web || card.web;
    card.image.url = item.image.url || card.image.url;
    card.image.alt = item.image.alt || card.image.alt;
    card.address.state = item.address.state;
    card.address.country = item.address.country;
    card.address.city = item.address.city;
    card.address.street = item.address.street;
    card.address.houseNumber = item.address.houseNamber;
    card.user_id = getUser(req)?._id || card.user_id;

    const updatedCard = await card.save();
    res.send(updatedCard);
  } else {
    res.status(401).send("User is not authorized");
  }
});

// Like card
app.patch("/cards/:id", guard, async (req, res) => {
  const user = getUser(req);

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid card ID");
  }

  const card = await Card.findById(req.params.id);

  if (!card) {
    return res.status(404).send({ message: "Card not found" });
  }

  if (user._id && !card.likes.includes(user._id)) {
    card.likes.push(user._id);
  } else {
    card.likes = card.likes.filter(
      (id) => id.toString() !== user._id.toString()
    );
  }

  const updatedCard = await card.save();
  res.send(updatedCard);
});

// Delete card
app.delete("/cards/:id", guard, async (req, res) => {
  const user = getUser(req);

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid card ID");
  }
  const card = await Card.findById(req.params.id);

  if (!card) {
    return res.status(404).send({ message: "Card not found" });
  }

  if (getUser(req).isAdmin || user._id == card.user_id) {
    await Card.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.send({ message: "Card deleted successfully" });
    res.end();
  } else {
    res.status(401).send("User is not authorized");
  }
});
