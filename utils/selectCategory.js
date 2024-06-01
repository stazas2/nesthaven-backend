import {
  ApartamentTypeModel,
  HouseTypeModel,
  GarageTypeModel,
  PlotTypeModel,
} from "../models/index.js"

const sameFields = [
  "typeTransaction",
  "typeObject",
  "category",
  "location",
  "photos",
  "plans",
  "heading",
  "description",
  "price",
  "phone",
  "messengers",
  "favourite",
]
export const categoryConfig = {
  apartment: {
    model: ApartamentTypeModel,
    fields: [
      ...sameFields,
      "typeStructure",
      "generalArea",
      "livingArea",
      "floor",
      "floorHouse",
      "number",
      "numberRooms",
      "balconies",
      "bathroom",
      "renovation",
      "parking",
      "elevators",
      "entrance",
    ],
  },
  house: {
    model: HouseTypeModel,
    fields: [
      ...sameFields,
      "typeStructure",
      "generalArea",
      "livingArea",
      "numberFloor",
      "numberRooms",
      "sewerage",
      "bathroom",
      "waterSupply",
      "gas",
      "heating",
      "electricity",
      "additionally",
    ],
  },
  garage: {
    model: GarageTypeModel,
    fields: [...sameFields, "generalArea", "waterSupply", "electricity"],
  },
  plot: {
    model: PlotTypeModel,
    fields: [
      ...sameFields,
      "generalArea",
      "waterSupply",
      "electricity",
      "gas",
      "sewerage",
    ],
  },
}

export const categoryModels = [ApartamentTypeModel, HouseTypeModel, GarageTypeModel, PlotTypeModel]

// деструктуризация
export const extractFields = (category, body) => {
  const fields = categoryConfig[category].fields
  const extracted = {}

  fields.forEach((field) => {
    if (body[field] !== undefined) {
      extracted[field] = body[field]
    }
  })

  return extracted
}
