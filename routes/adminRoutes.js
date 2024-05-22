import express from "express"
import { handleValidationError, categoryRules } from "../utils/index.js"
import { AdminController } from "../controllers/index.js"

const router = express.Router()

router.post(
  "/public",
  categoryRules,
  handleValidationError,
  AdminController.fetchDataCategory
)

export default router
