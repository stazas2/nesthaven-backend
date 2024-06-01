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
      from: process.env.mail,
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
    res.status(200).json({ status: "success" })
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
      return res
        .status(404)
        .json({ status: "fail", message: "Пользователь не найден" })
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
      // todo
      //? передача amountPages отдельно или optional
      page: _page,
      limit: _limit,
      amountPages: pages,
      sort: _sort,
      order: _order,
      objects: paginateObjects,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}

export const switchFavorite = async (req, res) => {
  try {
    const { _id: objectId, category, favourite: favouriteValue } = req.body
    const categoryModel = categoryConfig[category].model

    await categoryModel.findByIdAndUpdate(
      objectId,
      { $set: { favourite: !favouriteValue } },
      { new: true }
    )

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
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      status: "fail",
    })
  }
}
