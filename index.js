import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import {
  adminRoutes,
  userRoutes,
  authRoutes,
  storageRoute,
  aiRoute,
} from "./routes/index.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 4000
const mongoUri = process.env.MONGODB_URI

mongoose
  .connect(mongoUri)
  .then(() => console.log("DB loaded!"))
  .catch((err) => console.log("DB's not working!", err))

app.use(cookieParser()); //? Позволяет работать с куками
app.use(express.json()) //? Учим express обработать json формат
app.use(cors()) //? Разрешает любым доменам делать запрос к нашему backend

// Роуты
app.use("/", userRoutes)
app.use("/", authRoutes)
app.use("/", adminRoutes)
app.use("/", storageRoute)
app.use("/", aiRoute)

// Запуск
app.listen(PORT, (error) => {
  if (error) {
    return console.error(error)
  }

  console.log("Server's working!")
})
