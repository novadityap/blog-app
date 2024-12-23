const formatError = errors => {
  return errors.reduce((acc, curr) => {
    let message = curr.message.replace(/"/g, '');
    message = capitalizeMessage(message);
    
    acc[curr.context.label.replace(/\[0\]/g, '')] = message;
    return acc;
  }, {});
};

const capitalizeMessage = message => {
  return message.charAt(0).toUpperCase() + message.slice(1);
}

export default formatError;
