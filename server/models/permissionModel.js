import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  action: String,
  resource: String,
  description: String
}, {
  timestamps: true
});

const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;
