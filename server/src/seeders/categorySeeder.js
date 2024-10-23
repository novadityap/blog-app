import Category from "../models/categoryModel.js";

const seedCategory = async () => {
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
};

export default seedCategory;
