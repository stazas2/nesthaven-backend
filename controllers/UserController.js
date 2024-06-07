import { categoryConfig, categoryModels } from "../utils/selectCategory.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import { UserModel, OtpModel } from "../models/index.js"
import { rand } from "../utils/index.js"

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
    const code = rand() // Генерация случайного кода
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // Время истечения

    // Сохранение кода в базе данных
    const otp = new OtpModel({ email, code, expiresAt })
    await otp.save()

    // Создаем транспорт для отправки почты
    const transporter = nodemailer.createTransport({
      // Настройки для вашего почтового сервера
      host: "smtp.mail.ru",
      port: 587,
      secure: false,
      auth: {
        user: process.env.mail,
        pass: process.env.mailPass,
      },
    })

    // Опции для отправки письма
    const mailOptions = {
      from: `"Bitway Support" <${process.env.mail}>`,
      to: email,
      subject: "Запрос на сброс пароля",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p style="font-size: 16px;">Здравствуйте, ${user.firstName}!</p>
        <p>Мы получили запрос на отправку разового кода для вашей учетной записи Bitway.</p>
        <p style="font-size: 18px;"><strong>Ваш разовый код: <span style="color: #e74c3c;">${code}</span></strong></p>
        <p>Если вы не запрашивали этот код, можете смело игнорировать это сообщение электронной почты. Возможно, кто-то ввел ваш адрес электронной почты по ошибке.</p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">С уважением, <br> Команда Bitway</p>
      </div>
    `,
    }

    // Отправляем письмо
    await transporter.sendMail(mailOptions)

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

    // Поиск кода в базе данных
    const otp = await OtpModel.findOne({ code })

    if (!otp) {
      return res.status(400).json({ status: "fail", message: "Неверный код" })
    }

    // Проверка времени истечения
    if (new Date() > otp.expiresAt) {
      return res.status(400).json({ status: "fail", message: "Код истёк" })
    }

    const count = await OtpModel.countDocuments()

    //  todo
    //? Удаление старых документов, если количество превышает лимит
    const limit = 10
    if (count > limit) {
      const oldestDocuments = await OtpModel.find().limit(count - limit)
      await OtpModel.deleteMany({
        _id: { $in: oldestDocuments.map((doc) => doc._id) },
      })
    }

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
      _limit = 15,
      _sort = "createdAt",
      _order = "desc",
    } = req.query

    const skipObjects = (_page - 1) * _limit

    const objects = await Promise.all(
      categoryModels.map((model) => model.find())
    )
    const filteredObjects = objects
      .filter((result) => result.length !== 0)
      .flat()
    const pages = Math.ceil(filteredObjects.length / _limit)

    const sortedObjects = filteredObjects.sort((a, b) => {
      if (_order === "asc") {
        return a[_sort] - b[_sort]
      } else if (_order === "desc") {
        return b[_sort] - a[_sort]
      }
    })

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

    const exludeUserFields = "-passwordHash -__v -createdAt -updatedAt"
    const paginateObjectsWithUser = await Promise.all(
      paginateObjects.map(async (object) => {
        const user = await UserModel.findById(object.user).select(exludeUserFields)
        return { ...object._doc, user }
      })
    )

    res.status(200).json({
      status: "success",
      page: _page,
      limit: _limit,
      amountPages: pages,
      sort: _sort,
      order: _order,
      objects: paginateObjectsWithUser,
    })
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
      object = await model.findById(objectId)
      if (object) break
    }

    if (!object) {
      return res.status(404).json({
        status: "fail",
        message: "Такого объекта нет!",
      })
    }

    const exludeUserFields = "-passwordHash -__v -createdAt -updatedAt"
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
        const user = await UserModel.findById(object.user).select(exludeUserFields)
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
    const user = req.userId
    const objectId = req.body._id
    if (user) {
      const { category, favourite: favouriteValue } = req.body

      const categoryModel = categoryConfig[category].model

      // Логика для авторизованного пользователя
      let update = {}
      if (!favouriteValue) {
        // Если значение favourite меняется на true
        update = {
          $set: { favourite: !favouriteValue },
          $push: { favouriteUser: user },
        }
      } else {
        // Если значение favourite меняется на false
        update = {
          $set: { favourite: !favouriteValue },
        }
      }

      const object = await categoryModel.findByIdAndUpdate(objectId, update, {
        new: true,
      })

      if (!object) {
        return res.status(404).json({
          status: "fail",
          message: "Такого объекта нет!",
        })
      }

      res.status(200).json({
        status: "success",
        message: favouriteValue
          ? "Объект удален из избранного"
          : "Объект добавлен в избранное",
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
          success: "success",
          message: "Объект удален из избранного",
        })
      } else {
        favourites.push(objectId)

        res.cookie("favourites", JSON.stringify(favourites), {
          httpOnly: "success",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        }) // 30 дней

        return res.json({
          success: "success",
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
      const objects = await Promise.all(
        categoryModels.map((model) =>
          model.find({ favouriteUser: userId, favourite: true })
        )
      )

      favouriteIds = objects
        .filter((result) => result.length !== 0)
        .flat()
        .map((obj) => obj._id)
    } else {
      // Логика для неавторизованных пользователей
      favouriteIds = req.cookies.favourites
        ? JSON.parse(req.cookies.favourites)
        : []
    }

    if (favouriteIds.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Избранные объекты не найдены",
      })
    }

    // Получение объектов по их ID
    const objects = await Promise.all(
      categoryModels.map((model) => model.find({ _id: { $in: favouriteIds } }))
    )

    const favouriteObjects = objects
      .filter((result) => result.length !== 0)
      .flat()

    if (favouriteObjects.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Избранные объекты не найдены",
      })
    }
    // Неудаляемый куки-id - "665ef09ebed3db4ebe5b892e"
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
