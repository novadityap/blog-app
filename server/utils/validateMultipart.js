import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import validateSchema from './validateSchema.js';

const validateMultipart = {
  async single(req, schema = null, fieldName, required = false) {
    return this.fields(req, schema, [{ name: fieldName, maxCount: 1, required }]);
  },

  async array(req, schema = null, fieldName, maxCount, required = false) {
    return this.fields(req, schema, [{ name: fieldName, maxCount, required }]);
  },

  async fields(req, schema = null, fieldsConfig = [] ) {
    const maxFileSize = 2 * 1024 * 1024; 
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    const uploadDirs = {
      'avatar': path.join(process.cwd(), process.env.AVATAR_UPLOADS_DIR),
      'postImage': path.join(process.cwd(), process.env.POST_UPLOADS_DIR),
    };

    Object.values(uploadDirs).forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    try {
      const { fields: formFields, files: uploadedFiles } = await new Promise(
        (resolve, reject) => {
          const form = formidable({ multiples: true, keepExtensions: true });

          form.parse(req, (err, fields, files) => {
            if (err) {
              reject('Error parsing form');
            } else {
              resolve({ fields, files });
            }
          });
        }
      );

      const { validatedData, validationErrors } = validateSchema(schema, formFields);

      const fileErrors = fieldsConfig.reduce((acc, { name: fieldName, maxCount, required }) => {
          const filesForField = Array.isArray(uploadedFiles[fieldName])
            ? uploadedFiles[fieldName]
            : [];

          if (filesForField.length === 0) {
            if (required) acc[fieldName] = [`${fieldName} is required`];
            return acc;
          }

          if (filesForField.length > maxCount) {
            acc[fieldName] = [
              `${fieldName} must be less than ${maxCount} files`,
            ];
            return acc;
          }

          for (const file of filesForField) {
            if (file.size > maxFileSize) {
              acc[fieldName] = [
                `${fieldName} must be less than ${
                  maxFileSize / (1024 * 1024)
                }MB`,
              ];
              break;
            }

            if (!allowedMimeTypes.includes(file.mimetype)) {
              acc[fieldName] = ['Only jpeg and png files are allowed'];
              break;
            }
          }

          return acc;
        },
        {}
      );

      const combinedErrors = {
        ...validationErrors,
        ...fileErrors,
      };

      if (Object.keys(combinedErrors).length > 0) {
        for (const fileArray of Object.values(uploadedFiles)) {
          const filesToDelete = Array.isArray(fileArray) ? fileArray : [fileArray];
          for (const file of filesToDelete) {
            if (fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath);
            }
          }
        }

        return {
          validatedFiles: null,
          validationErrors: combinedErrors,
          validatedData: null,
        };
      }

      const savedFiles = {};
      for (const [fieldName, fileArray] of Object.entries(uploadedFiles)) {
        const filesForField = Array.isArray(fileArray)
          ? fileArray
          : [fileArray];
        savedFiles[fieldName] = [];

        const uploadDir =
          fieldName === 'avatar'
            ? uploadDirs.avatar
            : uploadDirs.post;

        for (const file of filesForField) {
          const newFilePath = path.join(uploadDir, file.newFilename);
          fs.copyFileSync(file.filepath, newFilePath);
          fs.unlinkSync(file.filepath);
          savedFiles[fieldName].push({ ...file, filepath: newFilePath });
        }
      }

      return {
        validatedFiles: savedFiles,
        validationErrors: null,
        validatedData,
      };
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default validateMultipart;

