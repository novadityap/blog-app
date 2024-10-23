import formidable from 'formidable';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import validateSchema from './validateSchema.js';

const checkDirAndCreate = async (fieldname) => {
  const uploadDirs = {
    avatar: path.join(process.cwd(), process.env.AVATAR_UPLOADS_DIR),
    postImage: path.join(process.cwd(), process.env.POST_UPLOADS_DIR),
  };

  if (uploadDirs[fieldname]) {
    try {
      await fs.access(uploadDirs[fieldname]);
    } catch (err) {
      await fs.mkdir(uploadDirs[fieldname], { recursive: true });
    } 

    return uploadDirs[fieldname];
  }

  return null;
}

const normalizeFields = (fields) => {
  const normalized = {};
  const isAlwaysArrayKey = (key) => ['roles', 'permissions'].includes(key);
  const normalizeKey = (key) => key.endsWith('[]') ? key.slice(0, -2) : key;

  for (const key in fields) {
    const normalizedKey = normalizeKey(key);

    if (isAlwaysArrayKey(normalizedKey)) {
      normalized[normalizedKey] = Array.isArray(fields[key]) ? fields[key] : [fields[key]];
    } else if (fields[key].length === 1) {
      normalized[normalizedKey] = fields[key][0];
    } else {
      normalized[normalizedKey] = fields[key];
    }
  }

  return normalized;
}

const removeUploadedFiles = async (uploadedFiles) => {
  for (const file of uploadedFiles) {
    await fs.unlink(file.filepath);
  }
};

const moveUploadedFiles = async (uploadedFiles, uploadDir) => {
  for (const file of uploadedFiles) {
    await fs.copyFile(file.filepath, path.join(uploadDir, file.newFilename));
    await fs.unlink(file.filepath);
  }
}

const uploadAndValidate = (req, {
  fieldname, 
  isRequired = false,
  formSchema = null
}) => {
  return new Promise((resolve, reject) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxFiles = 1;
    const maxFileSize = 2 * 1024 * 1024;
    const errors = {};
    
    const form = formidable({keepExtensions: true});

    try {
      form.on('fileBegin', (formname, file) => {
        if (formname !== fieldname && isRequired) {
          file.filepath = '';
          errors[fieldname] = [`${fieldname} is required`];
        }
      })
  
      form.on('file', async (formname, file) => {
        if (file.size > maxFileSize) {
          errors[fieldname] = [`File size must be less than ${maxFileSize / (1024 * 1024)}MB`];
          await fs.unlink(file.filepath);
        }
      });
  
      form.parse(req, async (err, fields, files) => {
        const uploadDir = await checkDirAndCreate(fieldname);
        let uploadedFiles = files?.[fieldname];
  
       if (isRequired || uploadedFiles) {
        if (!uploadedFiles) {
          errors[fieldname] = [`${fieldname} is required`];
        } else {
          if (uploadedFiles.length > maxFiles) {
            errors[fieldname] = [`Maximum allowed files: ${maxFiles}`];
  
            for (const file of uploadedFiles) {
              await fs.unlink(file.filepath);
            }
          }
  
          for (const file of uploadedFiles) {
            if (!allowedMimeTypes.includes(file.mimetype)) {
              errors[fieldname] = ['Only jpeg and png files are allowed'];
              await fs.unlink(file.filepath);
            }
          }
        }
       }

        let validatedFields;

        if (formSchema) {
          const normalizedFields = normalizeFields(fields);
          const result = validateSchema(formSchema, normalizedFields);
          validatedFields = result.validatedFields;

          if (result.validationErrors) {
            Object.assign(errors, result.validationErrors);
            
            if (uploadedFiles) {
              await removeUploadedFiles(uploadedFiles);
            }
          }
        }
        
        if (Object.keys(errors).length > 0) {
          return resolve({validatedFiles: null, validatedFields: null, validationErrors: errors});
        }

        if (uploadedFiles) {
          await moveUploadedFiles(uploadedFiles, uploadDir);
          return resolve({validatedFiles: uploadedFiles, validatedFields, validationErrors: null});
        }
        
        resolve({validatedFiles: null, validatedFields, validationErrors: null});
      });
    } catch (e) {
      reject(new Error(e));
    }
  });
};

export default uploadAndValidate;
