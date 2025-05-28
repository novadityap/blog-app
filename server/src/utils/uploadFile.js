import formidable from 'formidable';
import formatError from './formatError.js';
import ResponseError from './responseError.js';
import logger from './logger.js';
import cloudinary from './cloudinary.js';

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
          Object.assign(uploadErrors, formatError(error.details));
          return reject(
            new ResponseError('Validation errors', 400, uploadErrors)
          );
        }

        fields = value;
      } else {
        if (uploadErrors && uploadedFiles) {
          return reject(
            new ResponseError('Validation errors', 400, uploadErrors)
          );
        }
      }

      if (uploadedFiles) {
        const result = await cloudinary.uploader.upload(uploadedFiles[0].filepath, {
          folder: `${fieldname}s`
        });
        return resolve({ file: result, fields });
      }

      resolve({ file: null, fields });
    });
  });
};

export default uploadFile;
