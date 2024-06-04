import express from "express"
import {
  handleValidationError,
  categoryRules,
  checkAuth,
} from "../utils/index.js"
import { AdminController } from "../controllers/index.js"

const router = express.Router()

router.route("/admin")
  .get(checkAuth.mandatory, AdminController.getAllUserObjects)
  .post(checkAuth.mandatory, categoryRules, handleValidationError, AdminController.createObject);

router.route("/admin/:id")
  .get(checkAuth.mandatory, AdminController.getOneObject)
  .patch(checkAuth.mandatory, categoryRules, handleValidationError, AdminController.updateObject)
  .delete(checkAuth.mandatory, AdminController.deleteObject);

export default router
