<<<<<<< HEAD
import express from "express"
import { UserController } from "../controllers/index.js"
import {
  registerValidation,
  loginValidation,
  forgotValidation,
  otpValidation,
} from "../validations.js"
import { handleValidationError } from "../utils/index.js"
=======
import express from "express";
import { UserController, AdminController } from "../controllers/index.js";
import { registerValidation, loginValidation, forgotValidation, otpValidation } from "../validations.js";
import { checkAuth, handleValidationError } from "../utils/index.js";
>>>>>>> 311c2e0d9954a1b4923fb7bec37e23fdac1f9221

const router = express.Router();

router.post("/auth/login", loginValidation, handleValidationError, UserController.login);
router.post("/auth/create", registerValidation, handleValidationError, UserController.register);
router.post("/auth/forgot", forgotValidation, handleValidationError, UserController.forgotPass);
router.post("/auth/otp", otpValidation, handleValidationError, UserController.enterOtp);

<<<<<<< HEAD
router.post(
  "/auth/changePassword",
  registerValidation[1],
  handleValidationError,
  UserController.changePassword
)

export default router
=======
router.post("/auth/otp", otpValidation, handleValidationError, UserController.enterOtp);

// router.post(
//   "/me/favoruties",
//   // checkAuth,
//   UserController.addFavorite
// )

router.get("/auth/me", checkAuth, UserController.getMe);
router.get("/properties", UserController.getAllObjects);
router.get("/properties/:id", AdminController.getOneObject);

export default router;
>>>>>>> 311c2e0d9954a1b4923fb7bec37e23fdac1f9221
