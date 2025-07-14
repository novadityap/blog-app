import dotenv from 'dotenv';
import path from 'node:path';

const loadEnv = () => {
  const mode = process.env.NODE_ENV || 'development';
  const envFile = `.env.${mode}`;
  dotenv.config({ path: path.resolve(`${envFile}`) });
}

export default loadEnv;
