import mongoose from "mongoose"

const ApartamentTypeSchema = new mongoose.Schema(
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
    typeStructure: {
      type: String,
      required: true,
    },
    generalArea: {
      type: String,
      required: true,
    },
    livingArea: {
      type: String,
      required: true,
    },
    floor: {
      type: String,
      required: true,
    },
    floorHouse: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    numberRooms: {
      type: String,
      required: true,
    },
    balconies: {
      type: String,
      required: true,
    },
    bathroom: {
      type: String,
      required: true,
    },
    renovation: {
      type: String,
      required: true,
    },
    parking: {
      type: String,
      required: true,
    },
    elevators: {
      type: String,
      required: true,
    },
    entrance: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("Apartament", ApartamentTypeSchema)