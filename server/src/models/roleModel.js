import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: String,
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }]
}, {
  timestamps: true
});

const Role = mongoose.model('Role', roleSchema);
export default Role;