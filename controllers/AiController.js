import { generateContent } from "../utils/index.js"

const geminiModels = ["gemini-1.5-flash-001", "gemini-1.0-pro-001"]
let description = "",
  prompt = "",
  response = "",
  model = ""

const extraModel = async (req, res) => {
   try {
      model = geminiModels[1]
      response = await generateContent(prompt, model)
      res.status(200).json({ status: "success", response })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "fail",
        message: "Запрос не выполнен. Попробуйте через 10 секунд",
      })
    }
}

export const runRequest = async (req, res) => {
  try {
    model = geminiModels[0]
    description = JSON.stringify(req.body.descriptionObj)

    prompt = `Сделай мне небольшое привлекательное описание объекта недвижимости
      для клиента в 1-2-х абзацах на русском языке по данным JSON:
      ${description}`

    response = await generateContent(prompt, model)
    res.status(200).json({ status: "success", response })
  } catch (err) {
    await extraModel(req, res)
  }
}
