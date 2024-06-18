import express from "express"
import { AiController } from "../controllers/index.js"

const router = express.Router()

router
  .route("/admin/ai")
  .post(AiController.runRequest)

export default router
