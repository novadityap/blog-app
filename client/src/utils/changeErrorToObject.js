const changeErrorToObject = value => {
  const error = value.reduce((acc, curr) => {
    acc[curr.name] = curr.message;
    return acc;
  }, {});

  return error;
};

export default changeErrorToObject;
