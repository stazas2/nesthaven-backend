import { checkAuth } from "./utils/index.js"
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import config from "config"
import { adminRoutes, authRoutes } from "./routes/index.js"

const app = express()
const PORT = config.PORT || 4000

mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("DB loaded!"))
  .catch((err) => console.log("DB's not working!", err))

app.use(express.json()) //? Учим express как обработать json формат
app.use(cors()) //? Разрешает любым доменам делать запрос к нашему backend

// app.get("/", (req, res) => {
//   res.send("It's backEND, baby")
// })

// Роуты
app.use("/", authRoutes)
app.use("/", adminRoutes)

// Запуск
app.listen(PORT, (error) => {
  if (error) {
    return console.error(error)
  }

  console.log("Server's working!")
})

import multer from "multer"

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

app.use("/uploads", express.static("uploads")) //? Учим express как обрабатывать статические файлы в директории uploads по запросу к /uploads

app.post("/upload", checkAuth, upload.single("file"), (req, res) => {
  try {
    res.json({
      url: `/uploads/${req.file.originalname}`,
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Файл должен быть формата image" })
  }
})
