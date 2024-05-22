import {
  apartamentTypeValidation,
  houseTypeValidation,
  plotTypeValidation,
  garageTypeValidation,
} from "../validations.js"
import { body } from "express-validator"

const categoryValidation = (category, validations) => {
  return body("category").custom((value, { req }) => {
    if (value === category) {
      return Promise.all(validations.map((validation) => validation.run(req)))
    } else {
      return Promise.resolve()
    }
  })
}

export const categoryRules = [
  categoryValidation("apartment", apartamentTypeValidation),
  categoryValidation("house", houseTypeValidation),
  categoryValidation("plot", plotTypeValidation),
  categoryValidation("garage", garageTypeValidation),
]
