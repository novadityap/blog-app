import ResponseError from "./responseError.js";
const validation = (schema, data) => {
  const result = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if(result.error) {
    const errors = result.error.details.map(err => {
      const name = err.path[0];
      const message = err.message.replace(/"/g, '');
      return {name, message};
    });

    throw new ResponseError(JSON.stringify(errors), 400);
  }

  return result.value;
};

export default validation;