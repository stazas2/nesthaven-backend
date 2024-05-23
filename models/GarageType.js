import mongoose from "mongoose"

const GarageTypeSchema = new mongoose.Schema(
  {
    typeTransaction: {
      type: String,
      required: true,
    },
    typeObject: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    plans: {
      type: [String],
      default: [],
    },
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    messengers: {
      type: [String],
      default: [],
    },
    generalArea: {
      type: String,
      required: true,
    },
    waterSupply: {
      type: String,
      required: true,
    },
    electricity: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("Garage", GarageTypeSchema)
