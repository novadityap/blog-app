const formatError = errors => {
  return errors.reduce((acc, curr) => {
    const message = curr.message.replace(/"/g, '');
    acc[curr.context.label.replace(/\[0\]/g, '')] = message;
    return acc;
  }, {});
};

export default formatError;
