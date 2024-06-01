import express from "express"
import { AdminController, UserController } from "../controllers/index.js"
import {checkAuth} from "../utils/index.js"

const router = express.Router()

router.post("/favoruties", UserController.switchFavorite) // checkAuth,
router.get("/properties", UserController.getAllObjects)
router.get("/properties/:id", AdminController.getOneObject)
router.get("/auth/me", checkAuth, UserController.getMe)

export default router
