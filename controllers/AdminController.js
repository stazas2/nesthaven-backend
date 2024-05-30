import {
  categoryConfig,
  categoryModels,
  extractFields,
} from "../utils/selectCategory.js"

export const createObject = async (req, res) => {
  try {
    const category = req.body.category
    const user = { user: req.userId }
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

    const doc = new config.model({ ...data, ...user })
    const savedDoc = await doc.save()

    res.status(200).json({ status: "success", data: savedDoc })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}

export const getAllUserObjects = async (req, res) => {
  try {
    const user = { user: `${req.userId}` }
    let objects = []

    for (let model of categoryModels) {
      const result = await model.find(user)
      //.populate("user", "_id firstname lastname")

      if (result.length !== 0) {
        objects = objects.concat(result)
      }
    }

    if (objects.length === 0) {
      return res.status(404).json({
        message: "У риелтора нет недвижимостей",
      })
    }

    res.status(200).json({ status: "success", objects})
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
        message: "Такого объекта нет!",
      })
    }

    res.status(200).json({
      status: "success",
      object,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail"})
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

    res.status(200).json({
      status: "success",
      object,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}
