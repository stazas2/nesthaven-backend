import multer from "multer"
import { checkAuth } from "../utils/index.js"
import express from "express"

// Хранилище
const router = express.Router()
const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    callback(null, "uploads")
  },
  filename: (_, file, callback) => {
    callback(null, file.originalname)
  },
})
const upload = multer({ storage })

router.use("/uploads", express.static("uploads"))

router.post("/upload", checkAuth, upload.single("file"), (req, res) => {
  try {
    res.json({
      url: `/uploads/${req.file.originalname}`,
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({ status: "fail", message: "Файл должен быть формата image" })
  }
})

export default router
