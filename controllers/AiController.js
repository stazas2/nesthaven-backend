import { generateContent } from "../utils/ai.js"

export const runRequest = async (req, res) => {
   try {
      const response = await generateContent(JSON.stringify(req.body.descriptionObj))
      res.status(200).json({ status: "success", response })
   } catch (err) {
      console.log(err)
      res.status(500).json({ status: "fail" })
   }
}

