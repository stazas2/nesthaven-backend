import mongoose from "mongoose"

const HouseTypeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    typeTransaction: {
      type: String,
      required: true,
    },
    typeProperty: {
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
      type: Number,
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
    typeStructure: {
      type: String,
      required: true,
    },
    numberRooms: {
      type: String,
      required: true,
    },
    generalArea: {
      type: Number,
      required: true,
    },
    livingArea: {
      type: Number,
      required: true,
    },
    floorHouse: {
      type: String,
      required: true,
    },
    bathroom: {
      type: String,
      required: true,
    },
    sewerage: {
      type: String,
      required: true,
    },
    waterSupply: {
      type: String,
      required: true,
    },
    gas: {
      type: String,
      required: true,
    },
    heating: {
      type: String,
      required: true,
    },
    electricity: {
      type: String,
      required: true,
    },
    additionally: {
      type: [String],
      required: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
   },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("House", HouseTypeSchema)
