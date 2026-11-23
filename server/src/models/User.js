const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE_VALUES, DEFAULT_ROLE } = require('../constants/roles');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullAddress: { type: String, required: true },
    landmark: { type: String, default: '' },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: '' },
    password: { type: String, required: true, select: false, minlength: 6 },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: DEFAULT_ROLE,
    },
    avatar: { type: String, default: '' },
    city: { type: String, default: 'Ado-Ekiti' },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
