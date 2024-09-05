const normalizeBody = (body) => {
  const normalized = {};

  for (const key in body) {
    if (Array.isArray(body[key])) {
      normalized[key] = body[key][0];
    } else {
      normalized[key] = body[key]; 
    }
  }

  return normalized;
};

const validateSchema = (schema, body) => { 
  const data = normalizeBody(body);

  const result = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if(result.error) {
    const validationErrors = result.error.details.reduce((acc, curr) => {
      const message = curr.message.replace(/"/g, '');
      acc[curr.path[0]] = [message]
      return acc;
    }, {});

    return { validatedData: result.value, validationErrors };
  }

  return { validatedData: result.value, validationErrors: null };
};

export default validateSchema;