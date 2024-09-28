import Joi from 'joi';
import mongoose from 'mongoose';

const usernameSchema = Joi.string().alphanum().required();
const emailSchema = Joi.string().email().required();
const passwordSchema = Joi.string().min(6).required();
const signinPasswordSchema = Joi.string().required();
const newPasswordSchema = Joi.string().min(6).required().messages({
  'any.required': 'new password is required',
  'string.min': 'new password should be at least 6 characters long',
  'string.base': 'new password must be a string',
  'string.empty': 'new password cannot be an empty field',
});
const rolesSchema = Joi.array().items(
  Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('invalid role id');
    return value;
  })
).required();

const baseUserSchema = Joi.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  roles: rolesSchema
});

export const signupSchema = baseUserSchema.fork(['roles'], schema => schema.optional());

export const signinSchema = Joi.object({
  email: emailSchema,
  password: signinPasswordSchema,
});

export const verifyEmailSchema = Joi.object({
  email: emailSchema,
});

export const createUserSchema = baseUserSchema;

export const updateUserSchema = baseUserSchema.fork(
  ['username', 'email', 'password', 'roles'],
  schema => schema.optional()
);

export const resetPasswordSchema = Joi.object({
  newPassword: newPasswordSchema
});
