import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import UserModel from '../models/User.js'
import { readFileConfig } from '../utils/index.js'

export const register = async (req, res) => {
   try {
      const config = await readFileConfig()

      const { email, fullName, password, avatarUrl } = req.body

      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      const doc = new UserModel({
         email,
         fullName,
         avatarUrl,
         passwordHash,
      })

      const user = await doc.save()

      const token = jwt.sign(
         {
            _id: user._id,
         },
         config.secretKey,
         { expiresIn: '7d' }
      )

      const { passwordHash: _, ...userData } = user._doc

      res.json({
         ...userData,
         token,
      })
   } catch (err) {
      console.log(err)
      res.status(500).json({
         message: 'Не удалось зарегистрировать пользователя',
      })
   }
}

export const login = async (req, res) => {
   try {
      const config = await readFileConfig()
      const user = await UserModel.findOne({ email: req.body.email })

      if (!user) {
         return res.status(404).json({ message: 'Пользователь не найден' })
      }

      const isValidPassword = await bcrypt.compare(
         req.body.password,
         user.passwordHash
      )

      if (!isValidPassword) {
         return res.status(400).json({ message: 'Неверный логин или пароль' })
      }

      const token = jwt.sign(
         {
            _id: user._id,
         },
         config.secretKey,
         { expiresIn: '7d' }
      )

      // const { passwordHash: _, ...userData } = user._doc
      const { passwordHash, ...userData } = user._doc

      res.json({
         ...userData,
         token,
      })
   } catch (err) {
      console.log(err)
      res.status(500).json({
         message: 'Не удалось авторизовать пользователя',
      })
   }
}

export const getMe = async (req, res) => {
   try {
      const user = await UserModel.findById(req.userId)
      if (!user) {
         return res.status(404).json({ message: 'Пользователь не найден' })
      }
      const { passwordHash: _, ...userData } = user._doc
      res.json(userData)
   } catch (err) {
      console.log(err)
      res.status(500).json({
         message: 'Не удалось получить пользователя',
      })
   }
}








