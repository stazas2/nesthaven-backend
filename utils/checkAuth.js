import jwt from 'jsonwebtoken'
import readFileConfig from './readFileConfig.js'

//? Функция посредник - middleware

export default async (req, res, next) => {
   const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

   if (token) {
      try {
         const config = await readFileConfig()
         const decoded = jwt.verify(token, config.secretKey)
         req.userId = decoded._id
         next()
      } catch (err) {
         return res.status(403).json({ message: 'Нет доступа' })
      }
   } else {
      return res.status(403).json({ message: 'Нет доступа' })
   }

   //! next - это функция вызывается для продолжения выполнения к следующей middleware функции в методе app
}
