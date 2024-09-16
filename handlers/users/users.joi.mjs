import Joi from "joi";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,30}$/;
const phoneRegex =
  /^(?:\+972|0)(?:5[0-9]|2[0-9]|3[0-9]|4[0-9]|7[0-9]|8[0-9]|9[0-9])\d{7}$/;

export const UserLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const UserSignup = Joi.object({
  name: Joi.object({
    first: Joi.string().min(2).max(20).required(),
    middle: Joi.string().min(2).max(20).allow(""),
    last: Joi.string().min(2).max(20).required(),
  }).required(),
  phone: Joi.string().pattern(phoneRegex).min(9).max(11).required(),
  email: Joi.string().email().min(5).required(),
  password: Joi.string().pattern(passwordRegex).required(),
  address: Joi.object({
    state: Joi.string().min(2).max(256).allow(""),
    country: Joi.string().min(2).max(256).required(),
    city: Joi.string().min(2).max(256).required(),
    street: Joi.string().min(2).max(256).required(),
    houseNumber: Joi.number().required(),
  }).required(),
  image: Joi.object({
    url: Joi.string().min(14).allow(""),
    alt: Joi.string().min(2).max(256).allow(""),
  }).optional(),
  isBusiness: Joi.boolean(),
});
