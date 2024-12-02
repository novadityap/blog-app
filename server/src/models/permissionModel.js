import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  action: String,
  resource: String,
}, {
  timestamps: true
});

const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;
