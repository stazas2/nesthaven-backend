import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // avatar: {
    //   type: String,
    // },
    favouriteObject:{
      type: [String],
      default: [],
    },
    telegram: {
      type: String,
      default: "",
    },
    whatsApp: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("User", UserSchema)
