import express from "express"
import { UserController } from "../controllers/index.js"
import { checkAuth } from "../utils/index.js"

const router = express.Router()

router
  .route("/properties")
  .post(checkAuth.optional, UserController.switchFavourite)
  .get(UserController.getAllObjects)

router
  .route("/properties/:id")
  .get(UserController.getOneObject)
  .post(UserController.sendMessage)

router.get("/auth/me", checkAuth.mandatory, UserController.getMe)
router.get(
  "/auth/me/favourites",
  checkAuth.optional,
  UserController.getFavourites
)

export default router
