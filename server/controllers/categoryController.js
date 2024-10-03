import Category from "../models/categoryModel.js";
import ResponseError from "../utils/responseError.js";
import {
  createCategorySchema,
  updateCategorySchema
} from "../validations/categoryValidation.js";
import validateSchema from "../utils/validateSchema.js";
import validateObjectId from "../utils/validateObjectId.js";
import logger from "../utils/logger.js";

export const createCategory = async (req, res, next) => {
  try {
    const { validatedFields, validationErrors } = validateSchema(
      createCategorySchema,
      req.body
    );

    if (validationErrors) {
      logger.info("create category failed - invalid request fields");
      throw new ResponseError("Validation errors", 400, validationErrors);
    }

    const category = await Category.create(validatedFields);

    logger.info(`create category success - category created with id ${category._id}`);
    res.json({
      code: 200,
      message: "Category created successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed category id ${req.params.id}`);
      throw new ResponseError("Invalid id", 400, { id: ["Invalid or malformed category id"] });
    }

    const { validatedFields, validationErrors } = validateSchema(
      updateCategorySchema,
      req.body
    );  

    if (validationErrors) {
      logger.info("update category failed - invalid request fields");
      throw new ResponseError("Validation errors", 400, validationErrors);
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id },
      { validatedFields },
      { new: true }
    );

    if (!updatedCategory) {
      logger.info(`resource not found - category with id ${req.params.id} not found`);
      throw new ResponseError("Resource not found", 404);
    }

    logger.info(`update category success - category updated with id ${req.params.id}`);
    res.json({
      code: 200,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed category id ${req.params.id}`);
      throw new ResponseError("Invalid id", 400, { id: ["Invalid or malformed category id"] });
    }

    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) { 
      logger.info(`delete category failed - category not found with id ${req.params.id}`);
      throw new ResponseError("Category not found", 404); 
    }

    logger.info(`delete category success - category deleted with id ${req.params.id}`);
    res.json({
      code: 200,
      message: "Category deleted successfully",
    });

  } catch (err) {
    next(err);
  }
}

export const getCategoryById = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      logger.info(`resource not found - invalid or malformed category id ${req.params.id}`);
      throw new ResponseError("Invalid id", 400, { id: ["Invalid or malformed category id"] });
    } 

    const category = await Category.findById(req.params.id);

    if (!category) {
      logger.info(`resource not found - category not found with id ${req.params.id}`);
      throw new ResponseError("Category not found", 404);
    }

    logger.info(`fetch category success - category found with id ${req.params.id}`);
    res.json({
      code: 200,
      message: "Category found",
      data: category
    });

  } catch (err) {
    next(err);
  }
}

export const getCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;
    
    let filter = req.query.search ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } }
      ]
    } : {};

    const totalCategories = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / limit);

    const categories = await Category.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (categories.length === 0) {
      logger.info(`resource not found - categories not found`);
      return res.json({ code: 200, message: "No categories found", data: [] });
    }

    logger.info(`fetch categories success - ${categories.length} categories found`);
    res.json({
      code: 200,  
      message: "Categories found",
      data: categories ,
      meta: {
        pageSize: limit,
        totalItems: totalCategories,
        currentPage: page,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
} 


