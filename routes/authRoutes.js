import express from "express"
import { UserController } from "../controllers/index.js"
import {
  registerValidation,
  loginValidation,
  forgotValidation,
  otpValidation,
} from "../validations.js"
import { checkAuth, handleValidationError } from "../utils/index.js"

const router = express.Router()

router.post(
  "/auth/login",
  loginValidation,
  handleValidationError,
  UserController.login
)
router.post(
  "/auth/create",
  registerValidation,
  handleValidationError,
  UserController.register
)
router.post(
  "/auth/forgot",
  forgotValidation,
  handleValidationError,
  UserController.forgotPass
)
router.post(
  "/auth/otp",
  otpValidation,
  handleValidationError,
  UserController.enterOtp
)
router.get("/auth/me", checkAuth, UserController.getMe)

export default router
