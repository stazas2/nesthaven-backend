import express from "express"
import { PostController } from "../controllers/index.js"
import { postValidation } from "../validations.js"
import { checkAuth, handleValidationError } from "../utils/index.js"

const router = express.Router()

router.get("/posts", PostController.getAll)
router.get("/posts/:id", PostController.getOne)
router.post(
  "/posts",
  checkAuth,
  postValidation,
  handleValidationError,
  PostController.create
)
router.patch(
  "/posts/:id",
  checkAuth,
  postValidation,
  handleValidationError,
  PostController.update
)
router.delete("/posts/:id", checkAuth, PostController.remove)

export default router
