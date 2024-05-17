import { body } from 'express-validator'

export const registerValidation = [
   body('email', 'Неверный формат почты').isEmail(),
   body('password', 'Пароль должен состоять из 5 и более символов').isLength({
      min: 5,
   }),
   body('firstName', 'Имя должно состоять из 3 и более символов').isLength({
      min: 3,
   }),
   body('lastName', 'Фамилия должна состоять из 3 и более символов').isLength({
      min: 3,
   }),
   body('agree', 'Вы не согласились с условиями').optional().isBoolean(),
]

export const loginValidation = [
   body('email', 'Неверный формат почты').isEmail(),
   body('password', 'Неверный формат пароля').isLength({ min: 5 }),
]

export const postValidation = [
   body('title', 'Название статьи должно состоять из 3 и более символов')
      .isLength({ min: 3 })
      .isString(),
   body('text', 'Текст статьи должно состоять из 10 и более символов')
      .isLength({ min: 10 })
      .isString(),
   body('tags')
      .optional()
      .custom((value) => {
         if (!Array.isArray(value)) {
            throw new Error('tags должет быть массивом')
         }

         const isValidTags = value.every((tag) => typeof tag === 'string')
         if (!isValidTags) {
            throw new Error('tags должет содержать только строки')
         }

         return true
      }),
   body('imagesUrl')
      .optional()
      .custom((value) => {
         if (!Array.isArray(value)) {
            throw new Error('imagesUrl должет быть массивом')
         }

         const isValidLinks = value.every((item) => {
            return typeof item === 'string' && item.startsWith('http://')
         })

         if (!isValidLinks) {
            throw new Error('imagesUrl должен содержать только ссылки')
         }

         return true
      }),
]

