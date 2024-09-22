import joi from 'joi';
import mongoose from 'mongoose';

const usernameSchema = joi.string().alphanum().required();
const emailSchema = joi.string().email().required();
const oldPasswordSchema = joi.string().required();
const passwordSchema = joi.string().min(6).required();
const rolesSchema = joi.array().items(
  joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('invalid role id');
    return value;
  })
).required();

const baseUserSchema = joi.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  roles: rolesSchema
});

export const signupSchema = baseUserSchema.fork(['roles'], schema => schema.optional());

export const signinSchema = joi.object({
  email: emailSchema,
  password: passwordSchema,
});

export const verifyEmailSchema = joi.object({
  email: emailSchema,
});

export const createUserSchema = baseUserSchema;

export const updateUserSchema = baseUserSchema.fork(
  ['username', 'email', 'password', 'roles'],
  schema => schema.optional()
);

export const resetPasswordSchema = joi.object({
  oldPassword: oldPasswordSchema,
  newPassword: passwordSchema
});
