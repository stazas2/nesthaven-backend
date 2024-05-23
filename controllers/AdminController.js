import {
  ApartamentTypeModel,
  HouseTypeModel,
  GarageTypeModel,
  PlotTypeModel,
} from "../models/index.js"

export const fetchDataCategory = async (req, res) => {
  const category = req.body.category

  const categoryConfig = {
    apartment: {
      model: ApartamentTypeModel,
      fields: [
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
        //
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
        //
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
      fields: [
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
        //
        "generalArea",
        "waterSupply",
        "electricity",
      ],
    },
    plot: {
      model: PlotTypeModel,
      fields: [
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
        //
        "generalArea",
        "waterSupply",
        "electricity",
        "gas",
        "sewerage",
      ],
    },
  }

  const config = categoryConfig[category]

  if (!config) {
    return res.status(400).json({ message: "Invalid category" })
  }

  try {
    const data = {}
    config.fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field]
      }
    })

    const doc = new config.model(data)
    const savedDoc = await doc.save()

    res.status(200).json({ success: true, data: savedDoc })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Один из пунктов указан некорректно" })
  }
}
