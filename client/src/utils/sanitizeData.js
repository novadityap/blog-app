const sanitizeData = values => {
  for (const key in values) {
    if (values[key] === '') delete values[key];
  }

  return values;
};

export default sanitizeData;
