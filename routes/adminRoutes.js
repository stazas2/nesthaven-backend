import express from "express"
import {
  handleValidationError,
  categoryRules,
  checkAuth,
} from "../utils/index.js"
import { AdminController } from "../controllers/index.js"

const router = express.Router()

router.get("/admin", checkAuth, AdminController.getAllUserObjects)
router.get("/admin/:id", checkAuth, AdminController.getOneObject)
router.post(
  "/admin",
  checkAuth,
  categoryRules,
  handleValidationError,
  AdminController.createObject
)
router.patch(
  "/admin/:id",
  checkAuth,
  categoryRules,
  handleValidationError,
  AdminController.updateObject
)
router.delete("/admin/:id", checkAuth, AdminController.deleteObject)



export default router
