import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import config from "config"
import { UserModel, OtpModel } from "../models/index.js"
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

    res.json({
      ...userData,
      token,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Не удалось зарегистрировать пользователя",
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

    res.json({
      ...userData,
      token,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Не удалось авторизовать пользователя",
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
      message: "Не удалось получить пользователя",
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
      text: `Используйте следующий код для сброса пароля: ${code}`, // Текст письма с инструкциями для сброса пароля
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
      message: "Не удалось поменять пароль",
    })
  }
}

export const enterOtp = async (req, res) => {
  try {
    const { code } = req.body

    // Поиск кода в базе данных
    //? findById
    const otp = await OtpModel.findOne({ code })

    if (!otp) {
      return res.status(400).json({ message: "Invalid code" })
    }

    // Проверка времени истечения
    if (new Date() > otp.expiresAt) {
      return res.status(400).json({ message: "Code has expired" })
    }

    // Проверка количества документов в коллекции
    const count = await OtpModel.countDocuments()

    // Удаление старых документов, если количество превышает лимит
    const limit = 10
    if (count > limit) {
      const oldestDocuments = await OtpModel.find().limit(count - limit)
      await OtpModel.deleteMany({ _id: { $in: oldestDocuments.map(doc => doc._id) } })
    }

    res.status(200).json({ message: "Code is valid" })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Не удалось поменять пароль",
    })
  }
}
