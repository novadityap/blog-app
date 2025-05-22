const buildFormData = (data, options = {}) => {
  const formData = new FormData();
  const { fileFields = [], isMultiple = true } = options;

  const fileFieldList = Array.isArray(fileFields) ? fileFields : [fileFields];

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (fileFieldList.includes(key)) {
      if (isMultiple && Array.isArray(value)) {
        value.forEach((file) => {
          formData.append(key, file);
        });
      } else if (!isMultiple && value) {
        formData.append(key, value);
      }
    } 
    else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  return formData;
};

export default buildFormData;