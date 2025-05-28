import ResponseError from './responseError.js';
import logger from './logger.js';
import formatError from './formatError.js';

const validate = (schema, body) => {
  const result = schema.validate(body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (result.error) {
    const errors = formatError(result.error.details);
    throw new ResponseError('Validation errors', 400, errors);
  }

  return result.value;
};

export default validate;
