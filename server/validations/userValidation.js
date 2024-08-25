import joi from 'joi';

const usernameSchema = joi.string().alphanum().required();
const emailSchema = joi.string().email().required();
const passwordSchema = joi.string().min(6).required();

const baseUserSchema = joi.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = baseUserSchema;

export const signinSchema = joi.object({
  email: emailSchema,
  password: passwordSchema,
});

export const resendEmailSchema = joi.object({
  email: emailSchema,
});

export const createUserSchema = baseUserSchema;

export const updateUserSchema = baseUserSchema.fork(
  ['username', 'email', 'password'],
  schema => schema.optional()
);
