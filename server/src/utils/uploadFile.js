import formidable from 'formidable';
import formatError from './formatError.js';
import ResponseError from './responseError.js';
import cloudinary from './cloudinary.js';

const normalizeField = fields => {
  const normalized = {};

  const normalizeKey = key => (key.endsWith('[]') ? key.slice(0, -2) : key);

  for (const rawKey in fields) {
    const key = normalizeKey(rawKey);
    const value = fields[rawKey];

    if (Array.isArray(value) && value.length === 1) {
      normalized[key] = value[0];
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
};

const uploadFile = (
  req,
  {
    fieldname,
    folderName,
    isRequired = false,
    maxFiles = 1,
    existingFileCount = 0,
    formSchema = null,
  }
) => {
  return new Promise((resolve, reject) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxFileSize = 2 * 1024 * 1024;
    const uploadErrors = {};

    const form = formidable({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      let uploadedFiles = files?.[fieldname];

      if (isRequired && !uploadedFiles)
        uploadErrors[fieldname] = `${
          fieldname.charAt(0).toUpperCase() + fieldname.slice(1)
        } is required`;

      if (uploadedFiles) {
        const totalFileCount = uploadedFiles.length + existingFileCount;

        if (uploadedFiles.length > maxFiles || totalFileCount > maxFiles) {
          if (!uploadErrors[fieldname])
            uploadErrors[fieldname] = `Maximum allowed files is ${maxFiles}`;
        }

        for (const file of uploadedFiles) {
          if (file.size > maxFileSize) {
            if (!uploadErrors[fieldname])
              uploadErrors[fieldname] = `Maximum allowed size per file is ${
                maxFileSize / (1024 * 1024)
              }MB`;
          }

          if (!allowedMimeTypes.includes(file.mimetype)) {
            if (!uploadErrors[fieldname])
              uploadErrors[fieldname] = 'Only images are allowed';
          }
        }
      }

      if (formSchema) {
        const { value, error } = formSchema.validate(normalizeField(fields), {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error || Object.keys(uploadErrors).length > 0) {
          const errors = {
            ...(uploadErrors || {}),
            ...(error ? formatError(error.details) : {}),
          };

          return reject(new ResponseError('Validation errors', 400, errors));
        }

        fields = value;
      } else {
        if (Object.keys(uploadErrors).length > 0) {
          return reject(
            new ResponseError('Validation errors', 400, uploadErrors)
          );
        }
      }

      if (uploadedFiles) {
        const uploadedResults = [];
        for (const file of uploadedFiles) {
          const result = await cloudinary.uploader.upload(file.filepath, {
            folder: folderName,
          });

          uploadedResults.push(result);
        }

        return resolve({
          files: uploadedResults,
          fields,
        });
      }

      resolve({ files: null, fields });
    });
  });
};

export default uploadFile;
