import express from "express"
import { UserController } from "../controllers/index.js"
import { registerValidation, loginValidation } from "../validations.js"
import { checkAuth, handleValidationError } from "../utils/index.js"

const router = express.Router()

router.post(
  "/auth/login",
  loginValidation,
  handleValidationError,
  UserController.login
)
router.post(
  "/auth/register",
  registerValidation,
  handleValidationError,
  UserController.register
)
router.get("/auth/me", checkAuth, UserController.getMe)

export default router
