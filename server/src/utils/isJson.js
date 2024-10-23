const isJson = (value) => {
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
}

export default isJson;