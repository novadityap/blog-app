const validateSchema = (schema, body) => { 
  const result = schema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if(result.error) {
    const validationErrors = result.error.details.reduce((acc, curr) => {
      const message = curr.message.replace(/"/g, '');
      acc[curr.path[0]] = [message]
      return acc;
    }, {});

    return { validatedFields: null, validationErrors };
  }

  return { validatedFields: result.value, validationErrors: null };
};

export default validateSchema;