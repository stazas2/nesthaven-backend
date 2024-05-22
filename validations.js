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

export const forgotValidation = [
   body('email', 'Неверный формат почты').isEmail(),
]

export const otpValidation = [
   body('code', 'Invalid OTP code').isLength({ min: 5, max: 5 })
]


const categoryValidation = [
   body('typeTransaction').isString(),
   body('typeObject').isString(),
   body('category').isString(),
   body('location', 'Локация должна состоять из 5 и более символов').isLength({max: 5}),
   body('photos', 'photos должет быть массивом').optional().isArray(),
   body('plans', 'plans должет быть массивом').optional().isArray(),
   body('heading').isString(),
   body('description').optional().isString(),
   body('price').isString(),
   body('phone').isString(),
   body('messengers', 'messengers должет быть массивом').optional().isArray(),
]



//? Проверка на кол-во в цифрах
export const apartamentTypeValidation = [
   ...categoryValidation,
   body('typeStructure').isString(),
   body('generalArea', 'Превышен предел m2').isString().isLength({ max: 4 }),
   body('livingArea', 'Превышен предел m2').isString().isLength({ max: 4 }),
   body('floor').isString(),
   body('floorHouse').isString(),
   body('number').isString(),
   body('numberRooms', 'Превышен предел кол-ва комнат').isString().isLength({ max: 2 }),
   body('balconies').isString(),
   body('bathroom').isString(),
   body('renovation').isString(),
   body('parking').isString(),
   body('elevators').isString(),
   body('entrance').isArray({ min: 1 }),
]

export const houseTypeValidation = [
   ...categoryValidation,
   body('typeStructure').isString(),
   body('numberRooms').isString().isLength({ max: 2 }),
   body('generalArea', 'Превышен предел m2').isString().isLength({ max: 5 }),
   body('livingArea', 'Превышен предел m2').isString().isLength({ max: 5 }),
   body('numberFloor').isString(),
   body('bathroom').isString(),
   body('sewerage').isString(),
   body('waterSupply').isString(),
   body('gas').isString(),
   body('heating').isString(),
   body('electricity').isString(),
   body('additionally').isArray(),
]

export const garageTypeValidation = [
   ...categoryValidation,
   body('generalArea', 'Превышен предел m2').isString().isLength({ max: 5 }),
   body('waterSupply').isString(),
   body('electricity').isString(),
]

export const plotTypeValidation = [
   ...categoryValidation,
   body('generalArea', 'Превышен предел m2').isString().isLength({ max: 8 }),
   body('waterSupply').isString(),
   body('electricity').isString(),
   body('gas').isString(),
   body('sewerage').isString(),
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

