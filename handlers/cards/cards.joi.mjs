import Joi from "joi";

export const CardValid = Joi.object({
    title : Joi.string().min(2).max(256).required(),
    subtitle : Joi.string().min(2).max(256).required(),
    description : Joi.string().min(2).max(1024).required(),
    phone : Joi.string().min(9).max(11).required(),
    email: Joi.string().email().min(5).required(),
    web : Joi.string().min(14).allow(''),
    image: Joi.object({
        url: Joi.string().min(14).allow(''),
        alt: Joi.string().min(2).max(256).allow(''),
    }).optional(),
    address: Joi.object({
        state: Joi.string().min(2).max(256).allow(''),
        country: Joi.string().min(2).max(256).required(),
        city: Joi.string().min(2).max(256).required(),
        street: Joi.string().min(2).max(256).required(),
        houseNumber: Joi.number().required(),
    }).required(),
})