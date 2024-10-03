import Category from "../models/categoryModel.js";
import logger from "../utils/logger.js";

const seedCategory = async () => {
  try {
    const categories = [
      {name: "General"},
      {name: "Sports"},
      {name: "Entertainment"},
      {name: "Science"},
      {name: "Health"},
      {name: "Business"},
      {name: "Technology"}
    ];

    await Category.deleteMany();
    await Category.insertMany(categories);
    logger.info("category seeded successfully");
  } catch (err) {
    logger.error(`failed seeding category - ${err}`);
  }
};

export default seedCategory;
