import formidable from 'formidable';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import formatError from './formatError.js';
import ResponseError from './responseError.js';
import logger from './logger.js';

const ensureUploadDirExists = async directoryType => {
  const uploadDirectories = {
    avatar: path.join(process.cwd(), process.env.AVATAR_DIR),
    postImage: path.join(process.cwd(), process.env.POST_DIR),
  };

  const directoryPath = uploadDirectories[directoryType];
  if (!directoryPath) return null;

  try {
    await fs.access(directoryPath);
  } catch {
    await fs.mkdir(directoryPath, { recursive: true });
  }

  return directoryPath;
};

const normalizeField = fields => {
  const normalized = {};
  const isAlwaysArrayKey = key => ['roles', 'permissions'].includes(key);
  const normalizeKey = key => (key.endsWith('[]') ? key.slice(0, -2) : key);

  for (const key in fields) {
    const normalizedKey = normalizeKey(key);

    if (isAlwaysArrayKey(normalizedKey)) {
      normalized[normalizedKey] = Array.isArray(fields[key])
        ? fields[key]
        : [fields[key]];
    } else if (fields[key].length === 1) {
      normalized[normalizedKey] = fields[key][0];
    } else {
      normalized[normalizedKey] = fields[key];
    }
  }

  return normalized;
};

const removeFile = async uploadedFiles => {
  for (const file of uploadedFiles) {
    await fs.unlink(file.filepath);
  }
};

const moveFile = async (uploadedFiles, uploadDir) => {
  for (const file of uploadedFiles) {
    await fs.copyFile(file.filepath, path.join(uploadDir, file.newFilename));
    await fs.unlink(file.filepath);
  }
};

const uploadFile = (
  req,
  { fieldname, isRequired = false, formSchema = null }
) => {
  return new Promise((resolve, reject) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxFiles = 1;
    const maxFileSize = 2 * 1024 * 1024;
    const uploadErrors = {};

    const form = formidable({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      let uploadedFiles = files?.[fieldname];
      const uploadDir = await ensureUploadDirExists(fieldname);

      if (isRequired && !uploadedFiles)
        uploadErrors[fieldname] = `${fieldname} is required`;

      if ((isRequired && uploadedFiles) || (!isRequired && uploadedFiles)) {
        if (uploadedFiles.length > maxFiles) {
          if (!uploadErrors[fieldname])
            uploadErrors[fieldname] = `maximum allowed files is ${maxFiles}`;
        }

        for (const file of uploadedFiles) {
          if (file.size > maxFileSize) {
            if (!uploadErrors[fieldname])
              uploadErrors[fieldname] = `file size must be less than ${
                maxFileSize / (1024 * 1024)
              }MB`;
          }

          if (!allowedMimeTypes.includes(file.mimetype)) {
            if (!uploadErrors[fieldname])
              uploadErrors[fieldname].push(
                'only jpeg and png files are allowed'
              );
          }
        }
      }

      if (formSchema) {
        const { value, error } = formSchema.validate(normalizeField(fields), {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          logger.warn('validation errors');

          if (uploadedFiles) await removeFile(uploadedFiles);

          Object.assign(uploadErrors, formatError(error.details));
          return reject(
            new ResponseError('Validation errors', 400, uploadErrors)
          );
        }

        fields = value;
      } else {
        if (uploadErrors && uploadedFiles) {
          logger.warn('validation errors');
          
          await removeFile(uploadedFiles);
          return reject(
            new ResponseError('Validation errors', 400, uploadErrors)
          );
        }
      }

      if (uploadedFiles) {
        await moveFile(uploadedFiles, uploadDir);
        return resolve({ files: uploadedFiles, fields });
      }

      resolve({ files: null, fields });
    });
  });
};

export default uploadFile;
