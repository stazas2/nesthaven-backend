import { UserModel } from "../models/index.js"
import {
  categoryConfig,
  categoryModels,
  extractFields,
} from "../utils/selectCategory.js"

export const createObject = async (req, res) => {
  try {
    const category = req.body.category
    const userId = { user: req.userId }
    const { firstName, lastName } = await UserModel.findById(userId.user)

    const config = categoryConfig[category]
    if (!config) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid category" })
    }

    const data = config.fields.reduce((acc, field) => {
      if (req.body[field] !== undefined) {
        return { ...acc, [field]: req.body[field] }
      }

      return acc
    }, {})

    const doc = new config.model({ ...data, ...userId })
    const savedDoc = await doc.save()

    res
      .status(200)
      .json({
        status: "success",
        fullName: `${firstName} ${lastName}`,
        data: savedDoc,
      })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}

export const getAllUserObjects = async (req, res) => {
  try {
    const user = { user: req.userId }

    const promises = categoryModels.map((model) => model.find(user))
    const results = await Promise.all(promises)
    const objects = results.filter((result) => result.length !== 0).flat()

    if (objects.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "У риелтора нет недвижимостей",
      })
    }

    res.status(200).json({ status: "success", objects })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}

export const getOneObject = async (req, res) => {
  try {
    const objectId = req.params.id
    let object = null

    for (let model of categoryModels) {
      object = await model.findById(objectId)
      if (object) break
    }

    if (!object) {
      return res.status(404).json({
        status: "fail", 
        message: "Такого объекта нет!",
      })
    }

    const { category, typeTransaction, typeObject } = object
    const model = categoryConfig[category].model
    const similarObjects = await model.find({
      typeTransaction,
      typeObject,
      _id: { $ne: objectId },
    })

    res.status(200).json({
      status: "success",
      object,
      similarObjects,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
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
        status: "fail", 
        message: "Такого объекта нет!",
      })
    }

    res.status(200).json({
      status: "success",
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
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

    if (!object) {
      return res.status(404).json({
        status: "fail", 
        message: "Такого объекта нет!",
      })
    }

    res.status(200).json({
      status: "success",
      object,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}
