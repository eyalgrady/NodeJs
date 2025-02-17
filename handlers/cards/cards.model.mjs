import mongoose, { Schema } from "mongoose";

const Address = new Schema({
  state: String,
  country: String,
  city: String,
  street: String,
  houseNumber: Number,
  zip: String,
});

const Image = new Schema({
  url: String,
  alt: String,
});

const schema = new Schema({
  title: String,
  subtitle: String,
  description: String,
  phone: String,
  email: String,
  web: String,
  image: Image,
  address: Address,
  likes: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Card = mongoose.model("cards", schema); // Create a model from the schema
