import path from 'node:path';
const loadModel = async (modelName) => {
  const modelPath = path.join(process.cwd(), 'src/models', `${modelName}Model.js`);
  const model = await import(modelPath);

  return model.default;
}

export default loadModel;