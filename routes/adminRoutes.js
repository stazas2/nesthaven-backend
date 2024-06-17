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
  .post(checkAuth.mandatory, categoryRules, handleValidationError, AdminController.createObject)
  
router.route("/admin/:id")
  .get(checkAuth.mandatory, AdminController.getOneObject)
  .patch(categoryRules, handleValidationError, AdminController.updateObject)
  .delete(AdminController.deleteObject);
  
router.get("/admin/location", AdminController.getPropertyInfo)

router.post("/admin/addArchive", AdminController.archiveObject)
router.get("/admin/archive", checkAuth.mandatory, AdminController.getArchiveObjects)
router.get("/admin/archive/:id", checkAuth.mandatory, AdminController.getOneArchiveObject)
router.delete("/admin/deleteArchive/:id", checkAuth.mandatory, AdminController.deleteArchiveObject)

export default router
