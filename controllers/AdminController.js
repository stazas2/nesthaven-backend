import { ArhiveModel, UserModel } from "../models/index.js"
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

    const data = extractFields(category, req.body)
    const doc = new config.model({ ...data, ...userId })
    const savedDoc = await doc.save()

    res.status(200).json({
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

////////////////////////////////////////!
//////////////////? АРХИВ
////////////////////////////////////////!

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

    const archive = new ArhiveModel({ ...object.toObject() })
    await archive.save()

    await categoryModel.findByIdAndDelete(objectId)

    res.status(200).json({
      status: "success",
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
      return res.status(404).json({
        status: "fail",
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
    await ArhiveModel.findByIdAndDelete(objectId)

    const { category } = object[0]
    const categoryModel = categoryConfig[category].model

    const unArchiveObject = new categoryModel({ ...object[0].toObject() })
    await unArchiveObject.save()

    res.status(200).json({
      status: "success",
      message: "Объект успешно перемещён в список объектов",
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}

export const getListLocation = async (req, res) => {
  try {
    const detailedLocation = {
      Бендеры: ["Центр", "Ленинский", "Солнечный", "Борисовка"],
      Тирасполь: ["Центр", "Западный", "Мечникова", "Бородинка", "Южный"],
      "Григориопольский р-н": ["Глиное", "Маяк", "Спея"],
      "Дубоссарский р-н": ["Дубоссары", "Кошница", "Ливада", "Новосадовый"],
      "Каменский р-н": [
        "Каменка",
        "Быковцы",
        "Забродня",
        "Комаровка",
        "Коротнево",
        "Красногорье",
      ],
      "Рыбницкий р-н": [
        "Рыбница",
        "Бессarabovca",
        "Бucovățul Nou",
        "Cuzmir",
        "Glinjenica",
      ],
      "Слободзейский р-н": ["Слободзея", "Larga", "Molodiya", "Novosadovca"],
    }

    res.status(200).json({
      status: "success",
      detailedLocation,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}
