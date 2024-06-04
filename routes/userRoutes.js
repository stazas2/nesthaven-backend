import express from "express"
import { AdminController, UserController } from "../controllers/index.js"
import { checkAuth } from "../utils/index.js"

const router = express.Router()

router.route("/properties")
  .post(checkAuth.optional, UserController.switchFavourite)
  .get(UserController.getAllObjects)

router.route("/properties/:id")
  .post(UserController.switchFavourite)
  .get(AdminController.getOneObject)

router.get("/auth/me", UserController.getMe)
router.get("/auth/me/favourites", checkAuth.optional, UserController.getFavourites)

export default router
