import { validationResult } from "express-validator"

export default (req, res, next) => {
  const error = validationResult(req)
  if (!error.isEmpty()) {
    return res.status(400).json(error.array())
  }

  next()
}
