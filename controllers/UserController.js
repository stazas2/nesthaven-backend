import {
  categoryConfig,
  categoryModels,
  deleteFieldOr,
  sameFields,
  getRandomInt,
  sendMail,
  rangeField,
} from "../utils/index.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { UserModel, OtpModel } from "../models/index.js"

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const existUser = await UserModel.findOne({ email: email })
    if (existUser) {
      return res.status(400).json({
        status: "fail",
        message: "Пользователь с таким email уже существует",
      })
    }

    const doc = new UserModel({
      firstName,
      lastName,
      email,
      passwordHash,
    })
    const user = await doc.save()

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.secretKey,
      { expiresIn: "7d" }
    )

    const { passwordHash: _, ...userData } = user._doc

    res.status(200).json({
      status: "success",
      ...userData,
      token,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email })

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "Пользователь не найден" })
    }

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    )

    if (!isValidPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "Неверный логин или пароль" })
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.secretKey,
      { expiresIn: "7d" }
    )

    const { passwordHash: _, ...userData } = user._doc

    res.status(200).json({
      status: "success",
      ...userData,
      token,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const forgotPass = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email })

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "Пользователь не найден" })
    }

    const { email } = req.body
    const code = getRandomInt() // Генерация случайного кода
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // Время истечения

    // Сохранение кода в базе данных
    await new OtpModel({ email, code, expiresAt }).save()

    let mailMessage = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p style="font-size: 16px;">Здравствуйте, ${user.firstName}!</p>
      <p>Мы получили запрос на отправку разового кода для вашей учетной записи NestHaven.</p>
      <p style="font-size: 18px;"><strong>Ваш разовый код: <span style="color: #e74c3c;">${code}</span></strong></p>
      <p>Если вы не запрашивали этот код, можете смело игнорировать это сообщение электронной почты. Возможно, кто-то ввел ваш адрес электронной почты по ошибке.</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">С уважением, <br> Команда NestHaven</p>
    </div>
  `
    // Создаем транспорт для отправки почты
    sendMail(email, "Запрос на сброс пароля", mailMessage)

    // Отправляем успешный ответ
    res
      .status(200)
      .json({ status: "success", message: "Письмо успешно отправлено" })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const enterOtp = async (req, res) => {
  try {
    const { code } = req.body
    const otp = await OtpModel.findOne({ code })

    // Проверка времени истечения
    if (otp && new Date() > otp.expiresAt) {
      await OtpModel.deleteOne({ code })
      return res.status(400).json({ status: "fail", message: "Код истёк" })
    } else if (!otp) {
      return res.status(400).json({ status: "fail", message: "Неверный код" })
    }

    await OtpModel.deleteOne({ code })
    res.status(200).json({ status: "success", message: "Код подтвержден" })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "Пользователь не найден" })
    }

    const { passwordHash: _, ...userData } = user._doc

    res.status(200).json({ status: "success", userData })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const getAllObjects = async (req, res) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = "createdAt",
      _order = "desc",
      category,
    } = req.query

    let query = req.query
    let modelFields = ""

    if (query.location) {
      if (Array.isArray(query.location)) {
        query = {
          ...query,
          $or: query.location.map((loc) => ({
            location: { $regex: loc },
          })),
        }
        delete query.location
      } else {
        query.location = {
          $regex: query.location,
        }
      }
    }

    let rangeValidation = rangeField(query, [
      "generalArea",
      "livingArea",
      "price",
    ])

    // Фильтрация полей на основе категории и конфигурации
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([key, value]) => {
        // Игнорируем поля, начинающиеся с "_", и пустые значения
        if (key.startsWith("_") || value === "") {
          return false
        }

        //todo
        //? В отдельную логику (pushFieldOr)
        // Фильтрация по категории
        if (category) {
          modelFields = categoryConfig[category].fields
          if (key === "$or") {
            modelFields.push("$or")
          }
          return modelFields.includes(key)
        } else {
          if (key === "$or") {
            sameFields.push("$or")
          }
          return sameFields.includes(key)
        }
      })
    )

    if (category) {
      deleteFieldOr(modelFields)
    } else {
      deleteFieldOr(sameFields)
    }

    const objects = await Promise.all(
      categoryModels.map((model) => model.find(filteredQuery))
    )

    const sortedObjects = objects
      .filter((result) => result.length !== 0)
      .flat()
      .sort((a, b) => {
        if (_order === "asc") {
          return a[_sort] - b[_sort]
        } else if (_order === "desc") {
          return b[_sort] - a[_sort]
        }
      })

    const pages = Math.ceil(sortedObjects.length / _limit)
    const skipObjects = (_page - 1) * _limit
    const paginateObjects = sortedObjects.slice(
      skipObjects,
      skipObjects + +_limit
    )

    if (paginateObjects.length === 0) {
      return res.status(200).json({
        status: "success",
        objects: paginateObjects,
      })
    }

    const exludeUserFields = "-passwordHash -__v -createdAt -updatedAt -agree -whatsApp -telegram"
    //todo
    //? использоваться .populate('user')
    const paginateObjectsWithUser = await Promise.all(
      paginateObjects.map(async (object) => {
        const user = await UserModel.findById(object.user).select(
          exludeUserFields
        )
        return { ...object._doc, user }
      })
    )

    //? Добавление логики в случае неверного диапазона
    let response = {}
    if (!rangeValidation[0]) {
      response.message = "Невалидный диапазон для поля: " + rangeValidation[1]
    }

    response = {
      status: "success",
      ...response,
      filter: filteredQuery,
      page: _page,
      limit: _limit,
      amountPages: pages,
      sort: _sort,
      order: _order,
      objects: paginateObjectsWithUser,
    }

    res.status(200).json(response)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const getOneObject = async (req, res) => {
  try {
    const objectId = req.params.id
    let object = null

    for (let model of categoryModels) {
      object = await model.findByIdAndUpdate(objectId, { $inc: { viewsCount: 1 } })
      if (object) break
    }

    if (!object) {
      return res.status(404).json({
        status: "fail",
        message: "Такого объекта нет!",
      })
    }

    const exludeUserFields = "-passwordHash -__v -createdAt -updatedAt -agree"
    const user = await UserModel.findById(object.user).select(exludeUserFields)

    // Similar objects
    const { category, typeTransaction, typeProperty } = object
    const model = categoryConfig[category].model
    const similarObjects = await model.find({
      typeTransaction,
      typeProperty,
      _id: { $ne: objectId },
    })

    const similarObjectsWithUser = await Promise.all(
      similarObjects.map(async (object) => {
        return { ...object._doc, user }
      })
    )

    res.status(200).json({
      status: "success",
      object: { ...object._doc, user },
      similarObjects: similarObjectsWithUser,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: "fail" })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { email, password } = req.body

    const salt = await bcrypt.genSalt(10)
    const newPasswordHash = await bcrypt.hash(password, salt)

    await UserModel.findOneAndUpdate(
      { email },
      { $set: { passwordHash: newPasswordHash } }
    )

    res.status(200).json({
      status: "success",
      message: "Пароль успешно изменен",
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const switchFavourite = async (req, res) => {
  try {
    const userId = req.userId
    const objectId = req.body._id

    if (!objectId) {
      return res.status(400).json({
        status: "fail",
        message: "Такого объекта нет!",
      })
    }

    if (userId) {
      const user = await UserModel.findById(userId)
      const { favouriteObject } = user
      let favouriteValue = true

      let update = {}
      if (favouriteObject.includes(objectId)) {
        favouriteValue = false
        update = {
          $pull: { favouriteObject: objectId },
        }
      } else {
        update = {
          $addToSet: { favouriteObject: objectId },
        }
      }

      await user.updateOne(update, {
        new: true,
      })

      res.status(200).json({
        status: "success",
        message: favouriteValue
          ? "Объект добавлен в избранное"
          : "Объект удален из избранного",
        favouriteValue,
      })
    } else {
      // Для неавторизованного пользователя
      let favourites = req.cookies.favourites
        ? JSON.parse(req.cookies.favourites)
        : []

      if (favourites.includes(objectId)) {
        favourites = favourites.filter((id) => id !== objectId)
        res.cookie("favourites", JSON.stringify(favourites), {
          httpOnly: "success",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        }) // 30 дней
        return res.json({
          status: "success",
          message: "Объект удален из избранного",
        })
      } else {
        favourites.push(objectId)

        res.cookie("favourites", JSON.stringify(favourites), {
          httpOnly: "success",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        }) // 30 дней

        return res.json({
          status: "success",
          message: "Объект добавлен в избранное",
        })
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: "Произошла ошибка" })
  }
}

export const getFavourites = async (req, res) => {
  try {
    const userId = req.userId
    let favouriteIds = []

    if (userId) {
      // Логика для авторизованных пользователей
      const user = await UserModel.findById(userId)
      favouriteIds = user.favouriteObject
    } else {
      // Логика для неавторизованных пользователей
      favouriteIds = req.cookies.favourites
        ? JSON.parse(req.cookies.favourites)
        : []
    }

    if (favouriteIds.length === 0) {
      return res.status(200).json({
        status: "success",
        objects: favouriteIds,
      })
    }

    // Получение объектов по их ID
    const objects = await Promise.all(
      categoryModels.map((model) => model.find({ _id: { $in: favouriteIds } }))
    )

    let favouriteObjects = objects
      .filter((result) => result.length !== 0)
      .flat()

    if (userId) {
      const exludeUserFields =
        "-passwordHash -__v -createdAt -updatedAt -agree -favouriteObject"
      const user = await UserModel.findById(userId).select(exludeUserFields)
      favouriteObjects = await Promise.all(
        favouriteObjects.map(async (object) => {
          return { ...object._doc, user }
        })
      )
    }

    if (favouriteObjects.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "Избранные объекты не найдены",
      })
    }

    res.status(200).json({
      status: "success",
      objects: favouriteObjects,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const sendMessage = async (req, res) => {
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

    const { email: ownerEmail, firstName } = await UserModel.findById(
      object.user
    )
    const { name, phone, email, message } = req.body

    let mailMessage = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p style="font-size: 16px;">Здравствуйте, ${firstName}!<br>Вы получили сообщение от пользователя NestHaven:</p>
      <p style="font-size: 18px;"><strong>${message}</strong></p>
      <p style="font-size: 14px; color: #777;">${name} <br> ${phone} <br> ${email}</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">С уважением, <br> Команда NestHaven</p>
    </div>
  `
    sendMail(ownerEmail, "Сообщение от пользователя", mailMessage)

    // Отправляем успешный ответ
    res
      .status(200)
      .json({ status: "success", message: "Письмо успешно отправлено" })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const getHelp = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body

    let mailMessage = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p style="font-size: 16px;">Сообщение в поддержку от «<span style="color: blue">${email}</span>»:</p>
      <p style="font-size: 18px;"><strong>${message}</strong></p>
      <p style="font-size: 14px; color: #777;">${name} <br> ${phone}</p>
    </div>
  `
    //? Email поддержки
    let mail = `cvetlana-malysheva@mail.ru`

    sendMail(mail, "Служба поддержки", mailMessage)

    // Отправляем успешный ответ
    res
      .status(200)
      .json({ status: "success", message: "Письмо успешно отправлено" })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const getPopularObjects = async (req, res) => {
  try {
    const objects = await Promise.all(
      categoryModels.map((model) =>
        model.find().sort({ viewsCount: -1 })
      )
    )

    const popularObjects = objects
    //.filter((object) => object.viewsCount >= 2)
      .filter((result) => result.length !== 0)
      .flat()
      .filter((object) => object.viewsCount >= 2)
      .slice(0, 5)

    if (popularObjects.length === 0) {
      return res.status(200).json({
        status: "success",
        objects: popularObjects,
      })
    }

    res.status(200).json({
      status: "success",
      objects: popularObjects,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}
