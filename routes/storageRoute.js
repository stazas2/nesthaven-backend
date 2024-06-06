import multer from "multer"
import { checkAuth } from "../utils/index.js"
import express from "express"

// Хранилище
const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    callback(null, "uploads")
  },
  filename: (_, file, callback) => {
    callback(null, file.originalname)
  },
})
const upload = multer({ storage })

const uploadFile = (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      url: `/uploads/${req.file.originalname}`,
    })
  } catch (err) {
    console.log(err)
    res
      .status(400)
      .json({ status: "fail", message: "Файл должен быть формата image" })
  }
}

const router = express.Router()
router.use("/uploads", express.static("uploads"))

router.post(
  "/admin/upload",
  checkAuth.mandatory,
  upload.single("file"),
  uploadFile
)

export default router
