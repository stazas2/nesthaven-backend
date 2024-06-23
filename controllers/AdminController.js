import { ArhiveModel } from "../models/index.js"
import {
  categoryConfig,
  categoryModels,
  extractFields,
} from "../utils/index.js"
import { detailedLocation } from "../utils/index.js"

export const createObject = async (req, res) => {
  try {
    const category = req.body.category
    const userId = { user: req.userId }

    const config = categoryConfig[category]
    if (!config) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid category" })
    }

    const data = extractFields(category, req.body)
    const doc = await new config.model({ ...data, ...userId }).save()

    res.status(200).json({
      status: "success",
      data: doc,
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
      return res.status(200).json({
        status: "success",
        objects,
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
    const user = req.userId
    let object = null

    for (let model of categoryModels) {
      object = await model.findOne({ user, _id: objectId })
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
      object,
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
      message: "Объект успешно удален",
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

//////////////////////////////* АРХИВ
export const archiveObject = async (req, res) => {
  try {
    const { _id: objectId, category } = req.body
    const categoryModel = categoryConfig[category].model

    const object = await categoryModel.findById(objectId)
    if (!object) {
      return res.status(404).json({
        status: "fail",
        message: "Такого объекта нет!",
      })
    }

    // Сохранение объекта в архив
    await new ArhiveModel({ ...object.toObject() }).save()

    // Удаление из общего списка
    await categoryModel.findByIdAndDelete(objectId)

    res.status(200).json({
      status: "success",
      message: "Объект успешно добавлен в архив",
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}

// Получить объекты с архива
export const getArchiveObjects = async (req, res) => {
  try {
    const user = { user: req.userId }
    const archiveObjects = await ArhiveModel.find(user)

    if (archiveObjects.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "Архив пуст",
      })
    }

    res.status(200).json({
      status: "success",
      archiveObjects,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}

export const getOneArchiveObject = async (req, res) => {
  try {
    const objectId = req.params.id
    const user = req.userId
    const object = await ArhiveModel.findOne({ _id: objectId, user })

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

//Удалить объект с архива
export const deleteArchiveObject = async (req, res) => {
  try {
    const objectId = req.params.id
    const user = req.userId

    const object = await ArhiveModel.find({ _id: objectId, user })
    if (!object) {
      return res.status(404).json({
        status: "fail",
        message: "Такого объекта нет!",
      })
    }
    

    const { category } = object[0]
    const categoryModel = categoryConfig[category].model

    await new categoryModel({ ...object[0].toObject() }).save()
    await ArhiveModel.findByIdAndDelete(objectId)

    res.status(200).json({
      status: "success",
      message: "Объект успешно перемещён в список объектов",
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}

export const getPropertyInfo = async (req, res) => {
  try {
    const location = {...detailedLocation}

    res.status(200).json({
      status: "success",
      location,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}
