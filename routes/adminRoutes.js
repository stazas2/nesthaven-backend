import express from "express"
import {
  handleValidationError,
  categoryRules,
  checkAuth,
} from "../utils/index.js"
import { AdminController } from "../controllers/index.js"

const router = express.Router()

router
  .route("/admin")
  .get(checkAuth.mandatory, AdminController.getAllUserObjects)
  .post(
    checkAuth.mandatory,
    categoryRules,
    handleValidationError,
    AdminController.createObject
  )

router
  .route("/admin/:id")
  .get(checkAuth.mandatory, AdminController.getOneObject)
  .patch(categoryRules, handleValidationError, AdminController.updateObject)
  .delete(AdminController.deleteObject)

router.get("/location", AdminController.getPropertyInfo)

router.post("/addArchive", AdminController.archiveObject)
router.get("/archive", checkAuth.mandatory, AdminController.getArchiveObjects)

router
  .route("/archive/:id")
  .get(checkAuth.mandatory, AdminController.getOneArchiveObject)
  .delete(AdminController.deleteArchiveObject)

export default router
