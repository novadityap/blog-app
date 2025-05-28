const formatError = errors => {
  return errors.reduce((acc, curr) => {
    let message = curr.message.replace(/"/g, '');
    message = formatCamelCaseMessage(message);
    message = capitalizeFirstWord(message);
    
    acc[curr.context.label.replace(/\[0\]/g, '')] = message;
    return acc;
  }, {});
};

const capitalizeFirstWord = message => {
  return message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();
};

const formatCamelCaseMessage = message => {
  return message.replace(/([a-z])([A-Z])/g, '$1 $2');
};

export default formatError;