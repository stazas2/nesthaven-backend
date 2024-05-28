import {
  ApartamentTypeModel,
  HouseTypeModel,
  GarageTypeModel,
  PlotTypeModel,
} from "../models/index.js"
import { categoryConfig, categoryModels, extractFields } from "../utils/selectCategory.js"

export const fetchDataCategory = async (req, res) => {
  try {
    const category = req.body.category
    const user = { user: req.userId }

    const config = categoryConfig[category]

    if (!config) {
      return res.status(400).json({ message: "Invalid category" })
    }

    const data = config.fields.reduce((acc, field) => {
      if (req.body[field] !== undefined) {
        return { ...acc, [field]: req.body[field] }
      }

      return acc
    }, {})

    const doc = new config.model({ ...data, ...user })
    const savedDoc = await doc.save()

    res.status(200).json({ success: true, data: savedDoc })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Один из пунктов указан некорректно" })
  }
}

export const getAllObjects = async (req, res) => {
  try {
    const user = { user: `${req.userId}` }
    let objects = []

    for (let model of categoryModels) {
      const result = await model.find(user)
      //.populate("user", "_id firstname lastname")

      if (result.length !== 0) {
        objects.push(result)
      }
    }

    if (objects.length === 0) {
      return res.status(404).json({
        message: "У риелтора нет недвижимостей",
      })
    }

    res.status(200).json(objects)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Не удалось получить объекты" })
  }
}



export const getOneObject = async (req, res) => {
  try {
    // TODO 
    //? попытаться вынести в отдельную логику, оставляя только метод поиска Id    
    //* + deleteObject
    const objectId = req.params.id
    let object = null
  
    for (let model of categoryModels) {
      object = await model.findById(objectId)
      if (object) break 
    }
    
    if (!object) {
      return res.status(404).json({
        message: "Такого объекта нет!",
      })
    }
    //

    res.status(200).json({
      object,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Не удалось получить объект" })
  }
}


export const deleteObject = async (req, res) => {
  try {
    const objectId = req.params.id
    let object = null

    for (let model of categoryModels) {
      object = await model.findByIdAndDelete(objectId)
      if (object) break 
    }

    if (!object) {
      return res.status(404).json({
        message: "Такого объекта нет!",
      })
    }

    res.status(200).json({
      success: true,
    })
  } catch (err) {
    console.log(err) 
    res.status(500).json({ message: "Не удалось удалить объект" })
  }
}

export const updateObject = async (req, res) => {
  try {
    const objectId = req.params.id
    const category = req.body.category

    const categoryModel = categoryConfig[category].model
    const updateFields = extractFields(category, req.body)

    const object = await categoryModel.findByIdAndUpdate(
      objectId,
      { $set: { ...updateFields } },
      { new: true }
    )

    res.status(200).json({
      object,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Непредвиденная ошибка!" })
  }
}
