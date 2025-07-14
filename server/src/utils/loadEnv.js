import dotenv from 'dotenv';
import path from 'node:path';

const loadEnv = () => {
  const mode = process.env.NODE_ENV || 'development';
  const envFile = `.env.${mode}`;
  
  if (mode !== 'production') dotenv.config({ path: envFile }); 
}

export default loadEnv;
