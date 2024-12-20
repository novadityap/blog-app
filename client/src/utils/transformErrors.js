const transformErrors = errors => {
  return Object.entries(errors).reduce((acc, [key, value]) => {
    acc[key] = value[0];
    return acc;
  }, {});
};

export default transformErrors;
