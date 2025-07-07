import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: String,
}, {
  timestamps: true
});

roleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});


const Role = mongoose.model('Role', roleSchema);
export default Role;