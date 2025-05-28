import Category from '../models/categoryModel.js';
import logger from '../utils/logger.js';

const categorySeeder = async () => {
  const categories = [
    'Electronics',
    'Books',
    'Clothes',
    'Shoes',
    'Furniture',
    'Beauty',
    'Sports',
    'Home',
    'Kitchen',
    'Technology',
  ]

  await Category.deleteMany();
  await Category.insertMany(categories.map((category) => ({ name: category })));
  
  logger.info('Categories seeded successfully');
};

export default categorySeeder;
