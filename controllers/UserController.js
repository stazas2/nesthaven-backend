import { categoryConfig, categoryModels } from "../utils/selectCategory.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import config from "config"
import { UserModel, OtpModel, UserFavouriteModel } from "../models/index.js"
import { readFileConfig, rand } from "../utils/index.js"

export const register = async (req, res) => {
  try {
    const config = await readFileConfig()

    const { firstName, lastName, email, password, agree } = req.body

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const doc = new UserModel({
      firstName,
      lastName,
      email,
      passwordHash,
      agree,
    })

    const user = await doc.save()

    const token = jwt.sign(
      {
        _id: user._id,
      },
      config.secretKey,
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
    const config = await readFileConfig()
    const user = await UserModel.findOne({ email: req.body.email })

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" })
    }

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    )

    if (!isValidPassword) {
      return res.status(400).json({ message: "Неверный логин или пароль" })
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      config.secretKey,
      { expiresIn: "7d" }
    )

    // const { passwordHash: _, ...userData } = user._doc
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
      return res.status(404).json({ message: "Пользователь не найден" })
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
        user: config.mail,
        pass: config.mailPass,
      },
    })

    // Опции для отправки письма
    const mailOptions = {
      from: config.mail,
      to: email,
      subject: "Запрос на сброс пароля",
      text: `\tЗдравствуйте, ${email}!
      \nМы получили запрос на отправку разового кода для вашей учетной записи Bitway.
      \nВаш разовый код: ${code}
      \nЕсли вы не запрашивали этот код, можете смело игнорировать это сообщение электронной почты. Возможно, кто-то ввел ваш адрес электронной почты по ошибке.`,
    }

    // Отправляем письмо
    await transporter.sendMail(mailOptions)

    // Отправляем успешный ответ
    res
      .status(200)
      .json({ message: "Письмо успешно отправлено на указанный адрес" })
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
      return res.status(400).json({ status: "fail", message: "Invalid code" })
    }

    // Проверка времени истечения
    if (new Date() > otp.expiresAt) {
      return res
        .status(400)
        .json({ status: "fail", message: "Code has expired" })
    }

    // Проверка количества документов в коллекции
    const count = await OtpModel.countDocuments()

    // Удаление старых документов, если количество превышает лимит
    const limit = 10
    if (count > limit) {
      const oldestDocuments = await OtpModel.find().limit(count - limit)
      await OtpModel.deleteMany({
        _id: { $in: oldestDocuments.map((doc) => doc._id) },
      })
    }

    res.status(200).json({ status: "success" })
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
      return res.status(404).json({ message: "Пользователь не найден" })
    }

    const { passwordHash: _, ...userData } = user._doc

    res.json(userData)
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
    const filteredObjects = objects.filter((result) => result.length !== 0)
    const flattenObjects = filteredObjects.flat()
    const pages = Math.ceil(flattenObjects.length / _limit)

    const sortedObjects = flattenObjects.sort((a, b) => {
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
      return res.status(404).json({
        status: "fail",
        message: "Objects not found",
      })
    }

    res.status(200).json({
      status: "success",
      pagination: {
        // todo
        //? передача страниц отдельно (учитывать лимит либо default)
        page: _page,
        limit: _limit,
        amountPages: pages,
        sort: _sort,
        order: _order,
      },
      objects: paginateObjects,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

//* а также удаление из избранного
// todo
//? продумать общую логику для избранного вместо с созданием объекта (user: '', favor: false (default))
export const addFavorite = async (req, res) => {
  try {
    const objectId = req.body._id
    const { user, category } = req.body
    const categoryModel = categoryConfig[category].model
    const objectToAdd = await categoryModel.findById(objectId)

    const userFavourite = new UserFavouriteModel({
      user,
      //? id: objectId,
      category,
      object: objectToAdd,
    })

    await userFavourite.save()

    res.status(200).json({
      status: "success",
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}
