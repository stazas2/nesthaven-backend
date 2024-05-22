import express from "express"
import mongoose from "mongoose"
import multer from "multer"
import cors from "cors"
import config from "config"
import { checkAuth } from "./utils/index.js"
import { adminRoutes, authRoutes } from "./routes/index.js"

const app = express()
const PORT = config.PORT || 4000

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

mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("DB started"))
  .catch((err) => console.log("DB fatal", err))

app.use(express.json()) //? Учим express как обработать json формат
app.use(cors()) //? Разрешает любым доменам делать запрос к нашему backend
app.use("/uploads", express.static("uploads")) //? Учим express как обрабатывать статические файлы в директории uploads по запросу к /uploads

app.get("/", (req, res) => {
  res.send("Hello fullstack")
})

// Роуты
app.use("/", authRoutes)
app.use("/", adminRoutes)
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

// Запуск
app.listen(PORT, (error) => {
  if (error) {
    return console.error(error)
  }

  console.log("Server good working!")
})



// const app = express()
// const router = express.Router();

// // Простой маршрут для проверки
// router.post('/public', (req, res) => {
//   console.log('Route /api/public hit');
//   res.send('Route is working!');
// });

// // Подключение маршрутизатора
// app.use('/api', router);

// // Запуск сервера
// const PORT = 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });



