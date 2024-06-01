import express from "express"
import {
  handleValidationError,
  categoryRules,
  checkAuth,
} from "../utils/index.js"
import { AdminController } from "../controllers/index.js"

const router = express.Router()

router.get("/", checkAuth, AdminController.getAllUserObjects)

router.get("/:id", checkAuth, AdminController.getOneObject)

router.patch(
  "/:id",
  checkAuth,
  categoryRules,
  handleValidationError,
  AdminController.updateObject
)

router.delete("/:id", checkAuth, AdminController.deleteObject)

router.post(
  "/publish",
  checkAuth,
  categoryRules,
  handleValidationError,
  AdminController.createObject
)

export default router
