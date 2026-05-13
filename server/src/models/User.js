import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const USER_ROLES = ["petOwner", "veterinarian", "petShop", "groomer", "admin"];
export const APPROVAL_STATUSES = ["pending", "approved", "blocked"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: String,
    role: {
      type: String,
      enum: USER_ROLES,
      default: "petOwner"
    },
    avatar: String,
    address: String,
    bio: String,
    isEmailVerified: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: APPROVAL_STATUSES, default: "pending" },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLoginAt: Date,
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    providerProfile: {
      businessName: String,
      licenseNumber: String,
      serviceArea: String,
      specialties: [String]
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
