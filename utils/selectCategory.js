import {
  ApartamentTypeModel,
  HouseTypeModel,
  GarageTypeModel,
  PlotTypeModel,
} from "../models/index.js"

export const sameFields = [
  "typeTransaction",
  "typeProperty",
  "category",
  "location",
  "photos",
  "plans",
  "heading",
  "description",
  "price",
  "phone",
  "messengers",
]
export const categoryConfig = {
  "Квартира": {
    model: ApartamentTypeModel,
    fields: [
      ...sameFields,
      "typeStructure",
      "generalArea",
      "livingArea",
      "floor",
      "floorHouse",
      "numberRooms",
      "balconies",
      "bathroom",
      "renovation",
      "parking",
      "elevators",
      "entrance",
    ],
  },
  "Дом": {
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
  "Гараж": {
    model: GarageTypeModel,
    fields: [...sameFields, "generalArea", "waterSupply", "electricity"],
  },
  "Участок": {
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

export const categoryModels = [
  ApartamentTypeModel,
  HouseTypeModel,
  GarageTypeModel,
  PlotTypeModel,
]

// деструктуризация
export const extractFields = (category, body) => {
  const fields = categoryConfig[category].fields;
  return fields.reduce((acc, field) => {
    if (body[field] !== undefined) {
      acc[field] = body[field];
    }
    return acc;
  }, {});
};

