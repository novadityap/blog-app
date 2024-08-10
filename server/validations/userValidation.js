import joi from "joi";

const signupSchema = joi.object({
  username: 
    joi.string()
    .required()
    .alphanum(),
  email: 
    joi.string()
    .email()
    .required(),
  password: 
    joi.string()
    .min(6)
    .required(),
});

export {
  signupSchema
};