import mongoose from "mongoose"

const ArchiveSchema = new mongoose.Schema({
   // Поля, по коротрым делается поиск в БД, должны быть в схеме
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
}, { strict: false })

export default mongoose.model("Archive", ArchiveSchema)
