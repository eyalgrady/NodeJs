import mongoose, { Schema } from "mongoose";

const Name = new Schema({
  first: String,
  middle: String,
  last: String,
});

const Address = new Schema({
  state: String,
  country: String,
  city: String,
  street: String,
  houseNumber: Number,
});

const Image = new Schema({
  url: String,
  alt: String,
});

const schema = new Schema({
  name: Name,
  phone: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  address: Address,
  image: Image,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isBusiness: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model("users", schema);
