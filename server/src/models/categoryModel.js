import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String
}, {
  timestamps: true
});

categorySchema.pre('findByIdAndDelete', { document: false, query: true }, async function (next) {
  const categoryId = this.getQuery()._id;
  await mongoose.model('Post').deleteMany({ category: categoryId });
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;